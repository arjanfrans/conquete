'use strict';

const debug = require('debug')('risk:Game');
const Battle = require('./Battle');
const cardValidator = require('./card-validator');
const stateBuilder = require('./state-builder');
const constants = require('./constants');

const errors = require('./errors');

const ERRORS = errors.ERRORS;
const createError = errors.createError;

const events = require('./events');

const createEvent = events.createEvent;
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

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

                playerEmitter.emit(event, ...args);

                this.state.previousPlayerEvent = {
                    name: event,
                    playerId: playerId,
                    data: args
                };
            } else {
                debug('no player listener found', event, args);
            }
        } else if (this.gameEmitter) {
            const eventData = createEvent(event, ...args);

            this.gameEmitter.emit(eventData.name, eventData.data);

            this.state.previousTurnEvent = {
                name: event.name,
                data: args
            };
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

    start () {
        this.started = true;

        let previousTurnEvent = this.state.previousTurnEvent ? Object.assign({}, this.state.previousTurnEvent) : null;
        let previousPlayerEvent = this.state.previousPlayerEvent ? Object.assign({}, this.state.previousPlayerEvent) : null;

        this.emit(GAME_EVENTS.GAME_START, {});

        this.emit(GAME_EVENTS.TURN_CHANGE, {
            playerId: this.turn.player.id
        });

        if (previousTurnEvent && previousTurnEvent.name !== GAME_EVENTS.TURN_CHANGE &&
                previousTurnEvent.name !== GAME_EVENTS.GAME_START) {
            this.emit(previousTurnEvent.name, ...previousTurnEvent.data);
        } else {
            this.emit(GAME_EVENTS.PHASE_CHANGE, {
                playerId: this.turn.player.id,
                phase: this.phase
            });

            if (this.phase === PHASES.BATTLE) {
                this.emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
                    playerId: this.turn.player.id,
                    phase: this.turn.phase
                });
            }
        }

        if (previousPlayerEvent) {
            this.emit(previousPlayerEvent.name,
                    previousPlayerEvent.playerId,
                    ...previousPlayerEvent.data);
        } else {
            this.emit(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, this.turn.player.id, {
                availableTerritoryIds: this.board.getAvailableTerritories().map(territory => {
                    return territory.id;
                })
            });
        }
    }

    endTurn () {
        let turn = this.turn;

        turn.player = this.state.playerQueue.next();

        let afterTurnEvent = null;

        if (this.phase === PHASES.SETUP_A) {
            if (this.board.areAllTerritoriesOccupied()) {
                this.phase = PHASES.SETUP_B;

                this.emit(GAME_EVENTS.PHASE_CHANGE, {
                    playerId: this.turn.player.id,
                    phase: this.phase
                });
            } else {
                afterTurnEvent = () => {
                    this.emit(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, turn.player.id, {
                        availableTerritoryIds: this.board.getAvailableTerritories().map(territory => {
                            return territory.id;
                        })
                    });
                };
            }
        }

        if (this.phase === PHASES.SETUP_B) {
            if (this._noMoreStartUnits()) {
                this.phase = PHASES.BATTLE;

                this.emit(GAME_EVENTS.PHASE_CHANGE, {
                    playerId: this.turn.player.id,
                    phase: this.phase
                });
            } else {
                afterTurnEvent = () => {
                    this.emit(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, turn.player.id, {
                        availableUnits: this.availableUnits()
                    });
                };
            }
        }

        if (this.phase === PHASES.BATTLE) {
            this._applyMovements();

            this._resetTurnPhase();

            afterTurnEvent = () => {
                this.emit(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, turn.player.id, {
                    availableUnits: this.availableUnits()
                });
            };
        }

        this.emit(GAME_EVENTS.TURN_CHANGE, {
            playerId: turn.player.id
        });

        if (afterTurnEvent) {
            afterTurnEvent();
        }

        this.state.turnCount += 1;
    }

    _resetTurnPhase () {
        let turn = this.turn;

        turn.movements = new Map();
        turn.phase = TURN_PHASES.PLACEMENT;
        turn.battle = null;
        turn.unitsPlaced = 0;
        turn.cardBonus = 0;
        turn.wonBattle = false;
    }

    claimTerritory (territory) {
        if (territory.owner) {
            throw createError(ERRORS.TerritoryClaimedError, {
                territoryId: territory.id,
                owner: territory.owner.id
            });
        }

        this.turn.player.startUnits -= 1;
        territory.setOwner(this.turn.player, 1);

        this.emit(GAME_EVENTS.TERRITORY_CLAIMED, {
            playerId: this.turn.player.id,
            territoryId: territory.id,
            units: 1
        });

        this.endTurn();
    }

    deployOneUnit (territory) {
        if (territory.owner !== this.turn.player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: territory.id,
                owner: territory.owner.id
            });
        }

        if (this.turn.player.startUnits === 0) {
            throw createError(ERRORS.NoStartingUnitsError);
        }

        this.turn.player.startUnits -= 1;

        territory.addUnits(1);

        this.emit(GAME_EVENTS.DEPLOY_UNITS, {
            playerId: this.turn.player.id,
            territoryId: territory.id,
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
                territoryId: territory.id,
                owner: territory.owner.id
            });
        }

        let availableUnits = this.availableUnits();

        if (availableUnits >= units && availableUnits - units > -1) {
            this.turn.unitsPlaced += units;

            territory.addUnits(units);

            this.emit(GAME_EVENTS.DEPLOY_UNITS, {
                playerId: this.turn.player.id,
                territoryId: territory.id,
                units: units
            });
        } else {
            throw createError(ERRORS.NoUnitsErrors);
        }
    }

    attackPhase () {
        if (this.turn.player.cards.size > 4) {
            throw createError(ERRORS.RequireCardRedeemError, {
                cards: Array.from(this.turn.player.cards)
            });
        }

        let availableUnits = this.availableUnits();

        if (availableUnits !== 0) {
            throw createError(ERRORS.RequireDeployError, {
                units: availableUnits
            });
        }

        this.turn.phase = TURN_PHASES.ATTACKING;

        this.emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
            playerId: this.turn.player.id,
            phase: this.turn.phase
        });

        this.emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, this.turn.player.id, {});
    }

    redeemCards (cards) {
        if (cards.length !== 3) {
            throw createError(ERRORS.NumberOfCardsErrors);
        }

        if (!this.turn.player.hasCards(cards)) {
            throw createError(ERRORS.NotOwnCardsError, { cards });
        }

        let bonus = cardValidator.getBonus(this._cardBonus, cards);

        for (let card of cards) {
            this.turn.player.removeCard(card);
            this.state.cardQueue.push(card);
        }

        this.turn.cardBonus += bonus;

        this.emit(GAME_EVENTS.REDEEM_CARDS, {
            playerId: this.turn.player.id,
            cards: cards,
            bonus: bonus
        });
    }

    attack (fromTerritory, toTerritory, units) {
        if (this.turn.battle) {
            throw createError(ERRORS.AlreadyInBattleError);
        }

        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsError, { units });
        }

        if (fromTerritory.owner !== this.turn.player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: fromTerritory.id,
                owner: fromTerritory.owner
            });
        }

        if (toTerritory.owner === this.turn.player) {
            throw createError(ERRORS.AttackSelfError, {
                territoryId: toTerritory.id
            });
        }

        if (units > fromTerritory.units - 1) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        this.turn.battle = new Battle(fromTerritory, toTerritory, units);

        this.emit(GAME_EVENTS.ATTACK, {
            from: fromTerritory.id,
            to: toTerritory.id,
            attacker: this.turn.player.id,
            defender: toTerritory.owner.id,
            units: units
        });

        this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, this.turn.player.id, {
            type: 'attack',
            maxDice: Math.min(3, this.turn.battle.attackUnits)
        });
    }

    rollDice (numberOfDice) {
        let battle = this.turn.battle;

        if (Number.isNaN(numberOfDice) || numberOfDice < 1) {
            throw createError(ERRORS.InvalidDiceError, { dice: numberOfDice });
        }

        if (battle.attacker === battle.turn) {
            let playerId = battle.turn.id;
            let dice = battle.attackThrow(numberOfDice);

            this.emit(GAME_EVENTS.ATTACK_DICE_ROLL, { playerId, dice });

            if (!battle.isBattleOver()) {
                this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.defender.id, {
                    type: 'defend',
                    maxDice: Math.min(2, this.turn.battle.defendUnits)
                });
            } else {
                this._endBattle();
            }
        } else if (battle.defender === battle.turn) {
            let playerId = battle.turn.id;
            let defendResults = battle.defendThrow(numberOfDice);

            this.emit(GAME_EVENTS.DEFEND_DICE_ROLL, {
                dice: defendResults.dice,
                results: defendResults.results,
                playerId: playerId
            });

            if (!battle.isBattleOver()) {
                this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.attacker.id, {
                    type: 'attack',
                    maxDice: Math.min(3, battle.attackUnits),
                });
            } else {
                this._endBattle();
            }
        } else {
            throw createError(ERRORS.NotInBattleError);
        }
    }

    _endBattle () {
        let battle = this.turn.battle;

        if (battle.isBattleOver()) {
            this.emit(GAME_EVENTS.BATTLE_END, {
                type: battle.winner.owner === battle.attacker ? 'attacker' : 'defender',
                winner: battle.winner.owner.id,
            });

            if (battle.winner.owner === this.turn.player) {
                this.turn.wonBattle = true;

                if (battle.defender.isDead()) {
                    this._killPlayer(battle.attacker, battle.defender);
                }
            }

            this.turn.battle = null;

            if (this.isGameOver()) {
                this._endGame();
            } else {
                this.emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, this.turn.player.id, {});
            }
        }
    }

    fortifyPhase () {
        if (this.turn.wonBattle) {
            this._grabCard();
        }

        this.turn.phase = TURN_PHASES.FORTIFYING;

        this.emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
            playerId: this.turn.player.id,
            phase: this.turn.phase
        });

        this.emit(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, this.turn.player.id, {});
    }

    moveUnits (fromTerritory, toTerritory, units) {
        let player = this.turn.player;

        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsError, { units });
        }

        if (fromTerritory.owner !== player || toTerritory.owner !== player) {
            throw createError(ERRORS.MoveOwnTerritoriesError, {
                territoryIds: [
                    fromTerritory.owner !== player ? fromTerritory.id : null,
                    toTerritory.owner !== player ? toTerritory.id : null
                ].filter(Boolean)
            });
        }

        if (!fromTerritory.isAdjacentTo(toTerritory)) {
            throw createError(ERRORS.TerritoriesAdjacentError, {
                territoryIds: [fromTerritory.id, toTerritory.id]
            });
        }

        if (fromTerritory.units - units <= 0) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        let move = {
            from: fromTerritory,
            to: toTerritory,
            units: units
        };

        this.turn.movements.set(fromTerritory.id, move);

        this.emit(PLAYER_EVENTS.QUEUED_MOVE, player.id, {
            from: move.from.id,
            to: move.to.id,
            units: move.units
        });
    }

    isGameOver () {
        let playerCount = Array.from(this.players.values()).filter(player => !player.isDead()).length;

        return playerCount === 1;
    }

    winner () {
        let remainingPlayers = Array.from(this.players.values()).filter(player => !player.isDead());

        if (remainingPlayers.length === 1) {
            return remainingPlayers[0];
        }

        return null;
    }

    _noMoreStartUnits () {
        return Array.from(this.players.values()).every(player => {
            return player.startUnits === 0;
        });
    }

    _killPlayer (killer, killed) {
        this.state.playerQueue.remove(killed);

        // Get cards from the killed player
        let takenCards = [];

        for (let card of killed.cards) {
            killer.addCard(card);
            killed.removeCard(card);
            takenCards.push(card);

            this.emit(PLAYER_EVENTS.NEW_CARD, killer.id, {
                card: card
            });
        }

        this.emit(GAME_EVENTS.PLAYER_DEFEATED, {
            defeatedBy: killer.id,
            playerId: killed.id,
            numberOfCardsTaken: takenCards.length
        });
    }

    availableUnits (player) {
        player = player || this.turn.player;

        if ([PHASES.SETUP_A, PHASES.SETUP_B].includes(this.phase)) {
            return player.startUnits;
        }

        let bonusUnits = this.bonusUnits(player);

        debug('bonus', bonusUnits);

        let unitsPlaced = this.turn.player === player ? this.turn.unitsPlaced : 0;

        return bonusUnits.total - unitsPlaced;
    }

    bonusUnits (player) {
        player = player || this.turn.player;

        let territories = this.board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        let continents = this.board.getPlayerContinents(player);
        let continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.bonus;
        }, 0);

        let cardBonus = this.turn.player === player ? this.turn.cardBonus : 0;

        return {
            territoryBonus: territoryBonus,
            continentBonus: continentBonus,
            cardBonus: cardBonus,
            total: territoryBonus + continentBonus + cardBonus
        };
    }

    _applyMovements () {
        let movements = [];

        for (let move of this.turn.movements.values()) {
            movements.push({
                from: move.from.id,
                to: move.to.id,
                units: move.units
            });

            move.from.units -= move.units;
            move.to.units += move.units;
        }

        this.turn.movements.clear();

        this.emit(GAME_EVENTS.MOVE_UNITS, {
            playerId: this.turn.player.id,
            movements: movements
        });
    }

    _grabCard () {
        let card = this.state.cardQueue.pop();

        this.turn.player.addCard(card);

        this.emit(PLAYER_EVENTS.NEW_CARD, this.turn.player.id, {
            card: card
        });
    }

    _endGame () {
        this.emit(GAME_EVENTS.GAME_END, {
            winner: this.winner().id
        });
    }
}

module.exports = Game;
