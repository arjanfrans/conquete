'use strict';

const debug = require('debug')('risk:Game');
const Battle = require('./Battle');
const cardValidator = require('./card-validator');
const stateBuilder = require('./state-builder');
const constants = require('./constants');

const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

const events = require('./events');

const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;
const createEvent = require('strict-emitter').createEvent;

const PHASES = constants.PHASES;
const TURN_PHASES = constants.TURN_PHASES;

class Game {
    constructor (options, rawState) {
        this.gameEmitter = null;
        this.playerEmitters = null;
        this.state = stateBuilder(options, rawState);
        this.started = false;

        this._cardBonus = options.cardBonus;
    }

    emit (event, ...args) {
        const playerEvents = Object.keys(PLAYER_EVENTS).map(eventKey => PLAYER_EVENTS[eventKey]);

        if (playerEvents.includes(event)) {
            const playerId = args.shift();

            if (this.playerEmitters[playerId]) {
                const playerEmitter = this.playerEmitters[playerId];
                const eventData = createEvent(event, ...args);

                eventData.data.playerId = playerId;

                this.state.previousPlayerEvent = {
                    name: eventData.name,
                    playerId: playerId,
                    data: eventData.data
                };

                playerEmitter.emit(eventData.name, eventData.data);
            } else {
                debug('no player listener found', event, args);
            }
        } else if (this.gameEmitter) {
            const eventData = createEvent(event, ...args);

            this.state.previousTurnEvent = {
                name: event.name,
                data: eventData.data,
            };

            this.gameEmitter.emit(eventData.name, eventData.data);
        } else {
            debug('no game listener found');
        }
    }

    setEventEmitters (gameEvents, playerEvents) {
        this.gameEmitter = gameEvents;
        this.playerEmitters = playerEvents;
    }

    get turn () {
        return this.state.turn;
    }

    get phase () {
        return this.state.phase;
    }

    set phase (phase) {
        this.state.phase = phase;
    }

    get turnPhase () {
        return this.turn.phase;
    }

    get players () {
        return this.state.players;
    }

    get board () {
        return this.state.board;
    }

    _loadPreviousEvent (previousEvent, events) {
        let loadEvent = null;

        Object.keys(events).forEach(eventKey => {
            const event = events[eventKey];

            if (event.name === previousEvent) {
                loadEvent = event;
            }
        });

        return loadEvent;
    }

    start () {
        this.started = true;

        const previousTurnEvent = this.state.previousTurnEvent ? Object.assign({}, this.state.previousTurnEvent) : null;
        const previousPlayerEvent = this.state.previousPlayerEvent ? Object.assign({}, this.state.previousPlayerEvent) : null;

        this.emit(GAME_EVENTS.GAME_START, {});

        this.emit(GAME_EVENTS.TURN_CHANGE, {
            playerId: this.turn.player.getId()
        });

        if (previousTurnEvent && previousTurnEvent.name !== GAME_EVENTS.TURN_CHANGE.name &&
                previousTurnEvent.name !== GAME_EVENTS.GAME_START.name) {
            const event = this._loadPreviousEvent(previousTurnEvent.name, GAME_EVENTS);

            this.emit(event, previousTurnEvent.data);
        } else {
            this.emit(GAME_EVENTS.PHASE_CHANGE, {
                playerId: this.turn.player.getId(),
                phase: this.phase
            });

            if (this.phase === PHASES.BATTLE) {
                this.emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
                    playerId: this.turn.player.getId(),
                    phase: this.turn.phase
                });
            }
        }

        if (previousPlayerEvent) {
            const event = this._loadPreviousEvent(previousPlayerEvent.name, PLAYER_EVENTS);

            this.emit(event, previousPlayerEvent.playerId, previousPlayerEvent.data);
        } else {
            this.emit(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, this.turn.player.getId(), {
                territoryIds: this.board.getAvailableTerritories().map(territory => {
                    return territory.getId();
                })
            });
        }
    }

    endTurn () {
        const turn = this.turn;

        if (this.phase === PHASES.BATTLE) {
            this._applyMovements();
        }

        turn.player = this.state.playerQueue.next();

        let afterTurnEvent = null;

        if (this.phase === PHASES.SETUP_A) {
            if (this.board.areAllTerritoriesOccupied()) {
                this.phase = PHASES.SETUP_B;

                this.emit(GAME_EVENTS.PHASE_CHANGE, {
                    playerId: this.turn.player.getId(),
                    phase: this.phase
                });
            } else {
                afterTurnEvent = () => {
                    this.emit(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, turn.player.getId(), {
                        territoryIds: this.board.getAvailableTerritories().map(territory => {
                            return territory.getId();
                        })
                    });
                };
            }
        }

        if (this.phase === PHASES.SETUP_B) {
            if (this._noMoreStartUnits()) {
                this.phase = PHASES.BATTLE;

                this.emit(GAME_EVENTS.PHASE_CHANGE, {
                    playerId: this.turn.player.getId(),
                    phase: this.phase
                });
            } else {
                afterTurnEvent = () => {
                    this.emit(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, turn.player.getId(), {
                        remainingUnits: this.availableUnits(),
                        territoryIds: turn.player.getTerritories().map(territory => territory.getId())
                    });
                };
            }
        }

        if (this.phase === PHASES.BATTLE) {
            this._resetTurnPhase();

            afterTurnEvent = () => {
                this.emit(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, turn.player.getId(), {
                    units: this.availableUnits(),
                    territoryIds: turn.player.getTerritories().map(territory => territory.getId()),
                    cards: turn.player.getCards()
                });
            };
        }

        this.emit(GAME_EVENTS.TURN_CHANGE, {
            playerId: turn.player.getId()
        });

        if (afterTurnEvent) {
            afterTurnEvent();
        }

        this.state.turnCount += 1;
    }

    _resetTurnPhase () {
        this.turn.movements = new Map();
        this.turn.phase = TURN_PHASES.PLACEMENT;
        this.turn.battle = null;
        this.turn.unitsPlaced = 0;
        this.turn.cardBonus = 0;
        this.turn.wonBattle = false;
    }

    claimTerritory (territory) {
        if (territory.owner) {
            throw createError(ERRORS.TerritoryClaimedError, {
                territoryId: territory.getId(),
                owner: territory.owner.getId()
            });
        }

        this.turn.player.removeStartUnit();
        territory.setOwner(this.turn.player, 1);

        this.emit(GAME_EVENTS.TERRITORY_CLAIMED, {
            playerId: this.turn.player.getId(),
            territoryId: territory.getId(),
            units: 1
        });

        this.endTurn();
    }

    deployOneUnit (territory) {
        if (territory.owner !== this.turn.player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: territory.getId(),
                owner: territory.owner.getId()
            });
        }

        if (!this.turn.player.hasStartUnits()) {
            throw createError(ERRORS.NoStartingUnitsError);
        }

        this.turn.player.removeStartUnit();

        territory.addUnits(1);

        this.emit(GAME_EVENTS.DEPLOY_UNITS, {
            playerId: this.turn.player.getId(),
            territoryId: territory.getId(),
            units: 1
        });

        this.endTurn();
    }

    deployUnits (territory, units) {
        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsError, { units });
        }

        if (territory.owner !== this.turn.player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: territory.getId(),
                owner: territory.owner.getId()
            });
        }

        const availableUnits = this.availableUnits();

        if (availableUnits >= units && availableUnits - units > -1) {
            this.turn.unitsPlaced += units;

            territory.addUnits(units);

            this.emit(GAME_EVENTS.DEPLOY_UNITS, {
                playerId: this.turn.player.getId(),
                territoryId: territory.getId(),
                units: units
            });
        } else {
            throw createError(ERRORS.NoUnitsError);
        }
    }

    attackPhase () {
        if (this.turn.player.getCards().length > 4) {
            throw createError(ERRORS.RequireCardRedeemError, {
                cards: this.turn.player.getCards()
            });
        }

        const availableUnits = this.availableUnits();

        if (availableUnits !== 0) {
            throw createError(ERRORS.RequireDeployError, {
                units: availableUnits
            });
        }

        this.turn.phase = TURN_PHASES.ATTACKING;

        this.emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
            playerId: this.turn.player.getId(),
            phase: this.turn.phase
        });

        this.emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, this.turn.player.getId(), {});
    }

    redeemCards (cards) {
        if (cards.length !== 3) {
            throw createError(ERRORS.NumberOfCardsError);
        }

        if (!this.turn.player.hasCards(cards)) {
            throw createError(ERRORS.NotOwnCardsError, { cards });
        }

        const bonus = cardValidator.getBonus(this._cardBonus, cards);

        for (const card of cards) {
            this.turn.player.removeCard(card);
            this.state.cardQueue.push(card);
        }

        this.turn.cardBonus += bonus;

        this.emit(GAME_EVENTS.REDEEM_CARDS, {
            playerId: this.turn.player.getId(),
            cards: cards,
            bonus: bonus
        });
    }

    attack (fromTerritory, toTerritory, units) {
        if (this.turn.battle) {
            throw createError(ERRORS.AlreadyInBattleError);
        }

        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsEror, { units });
        }

        if (fromTerritory.owner !== this.turn.player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: fromTerritory.getId(),
                owner: fromTerritory.owner.getId()
            });
        }

        if (toTerritory.owner === this.turn.player) {
            throw createError(ERRORS.AttackSelfError, {
                territoryId: toTerritory.getId()
            });
        }

        if (units > fromTerritory.units - 1) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        this.turn.battle = Battle.create({
            from: fromTerritory,
            to: toTerritory,
            units
        });

        this.emit(GAME_EVENTS.ATTACK, {
            from: fromTerritory.getId(),
            to: toTerritory.getId(),
            attacker: this.turn.player.getId(),
            defender: toTerritory.owner.getId(),
            units: units
        });

        this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, this.turn.player.getId(), {
            type: 'attacker',
            maxDice: Math.min(3, this.turn.battle.getAttackUnits())
        });
    }

    rollDice (numberOfDice) {
        const battle = this.turn.battle;

        if (Number.isNaN(numberOfDice) || numberOfDice < 1) {
            throw createError(ERRORS.InvalidDiceError, { dice: numberOfDice });
        }

        if (battle.getAttacker() === battle.getTurn()) {
            const playerId = battle.getTurn().getId();
            const dice = battle.attackThrow(numberOfDice);

            this.emit(GAME_EVENTS.ATTACK_DICE_ROLL, { playerId, dice });

            if (!battle.hasEnded()) {
                this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.getDefender().getId(), {
                    type: 'defender',
                    maxDice: Math.min(2, battle.getDefendUnits())
                });
            } else {
                this._endBattle();
            }
        } else if (battle.getDefender() === battle.getTurn()) {
            const playerId = battle.getTurn().getId();
            const defendResults = battle.defendThrow(numberOfDice);

            this.emit(GAME_EVENTS.DEFEND_DICE_ROLL, {
                dice: defendResults.dice,
                results: defendResults.results,
                playerId: playerId
            });

            if (!battle.hasEnded()) {
                this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.getAttacker().getId(), {
                    type: 'attacker',
                    maxDice: Math.min(3, battle.getAttackUnits()),
                });
            } else {
                this._endBattle();
            }
        } else {
            throw createError(ERRORS.NotInBattleError);
        }
    }

    _endBattle () {
        const battle = this.turn.battle;

        if (battle.hasEnded()) {
            this.emit(GAME_EVENTS.BATTLE_END, {
                type: battle.getWinner() === battle.getAttacker() ? 'attacker' : 'defender',
                winner: battle.hasEnded() ? battle.getWinner().getId() : null,
            });

            if (battle.getWinner() === this.turn.player) {
                this.turn.wonBattle = true;

                if (battle.getDefender().isDead()) {
                    this._killPlayer(battle.getAttacker(), battle.getDefender());
                }
            }

            this.turn.battle = null;

            if (this.isGameOver()) {
                this._endGame();
            } else {
                this.emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, this.turn.player.getId(), {});
            }
        }
    }

    fortifyPhase () {
        if (this.turn.wonBattle) {
            this._grabCard();
        }

        this.turn.phase = TURN_PHASES.FORTIFYING;

        this.emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
            playerId: this.turn.player.getId(),
            phase: this.turn.phase
        });

        this.emit(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, this.turn.player.getId(), {});
    }

    moveUnits (fromTerritory, toTerritory, units) {
        const player = this.turn.player;

        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsError, { units });
        }

        if (fromTerritory.owner !== player || toTerritory.owner !== player) {
            throw createError(ERRORS.MoveOwnTerritoriesError, {
                territoryIds: [
                    fromTerritory.owner !== player ? fromTerritory.getId() : null,
                    toTerritory.owner !== player ? toTerritory.getId() : null
                ].filter(Boolean)
            });
        }

        if (!fromTerritory.isAdjacentTo(toTerritory)) {
            throw createError(ERRORS.TerritoriesAdjacentError, {
                territoryIds: [fromTerritory.getId(), toTerritory.getId()]
            });
        }

        if (fromTerritory.units - units <= 0) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        const move = {
            from: fromTerritory,
            to: toTerritory,
            units: units
        };

        this.turn.movements.set(fromTerritory.getId(), move);

        this.emit(PLAYER_EVENTS.QUEUED_MOVE, player.getId(), {
            from: move.from.getId(),
            to: move.to.getId(),
            units: move.units
        });
    }

    isGameOver () {
        const playerCount = Array.from(this.players.values()).filter(player => !player.isDead()).length;

        return playerCount === 1;
    }

    winner () {
        const remainingPlayers = Array.from(this.players.values()).filter(player => !player.isDead());

        if (remainingPlayers.length === 1) {
            return remainingPlayers[0];
        }

        return null;
    }

    _noMoreStartUnits () {
        return Array.from(this.players.values()).every(player => {
            return !player.hasStartUnits();
        });
    }

    _killPlayer (killer, killed) {
        this.state.playerQueue.remove(killed);

        // Get cards from the killed player
        const takenCards = [];

        for (const card of killed.getCards()) {
            killer.addCard(card);
            killed.removeCard(card);
            takenCards.push(card);

            this.emit(PLAYER_EVENTS.NEW_CARD, killer.getId(), {
                card: card
            });
        }

        this.emit(GAME_EVENTS.PLAYER_DEFEATED, {
            defeatedBy: killer.getId(),
            playerId: killed.getId(),
            numberOfCardsTaken: takenCards.length
        });
    }

    availableUnits (player) {
        player = player || this.turn.player;

        if ([PHASES.SETUP_A, PHASES.SETUP_B].includes(this.phase)) {
            return player.getStartUnits();
        }

        const bonusUnits = this.bonusUnits(player);

        debug('bonus', bonusUnits);

        const unitsPlaced = this.turn.player === player ? this.turn.unitsPlaced : 0;

        return bonusUnits.total - unitsPlaced;
    }

    bonusUnits (player) {
        player = player || this.turn.player;

        const territories = this.board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        const continents = this.board.getPlayerContinents(player);
        const continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.getBonus();
        }, 0);

        const cardBonus = this.turn.player === player ? this.turn.cardBonus : 0;

        return {
            territoryBonus: territoryBonus,
            continentBonus: continentBonus,
            cardBonus: cardBonus,
            total: territoryBonus + continentBonus + cardBonus
        };
    }

    _applyMovements () {
        const movements = [];

        for (const move of this.turn.movements.values()) {
            movements.push({
                from: move.from.getId(),
                to: move.to.getId(),
                units: move.units
            });

            move.from.units -= move.units;
            move.to.units += move.units;
        }

        this.turn.movements.clear();

        this.emit(GAME_EVENTS.MOVE_UNITS, {
            playerId: this.turn.player.getId(),
            movements: movements
        });
    }

    _grabCard () {
        const card = this.state.cardQueue.pop();

        this.turn.player.addCard(card);

        this.emit(PLAYER_EVENTS.NEW_CARD, this.turn.player.getId(), {
            card: card
        });
    }

    _endGame () {
        this.emit(GAME_EVENTS.GAME_END, {
            winner: this.winner().getId()
        });
    }
}

module.exports = Game;
