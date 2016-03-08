'use strict';

const debug = require('debug')('risk:Game');
const Player = require('./Player');
const Board = require('./Board');
const Battle = require('./Battle');
const State = require('./State');
const RotatingQueue = require('./RotatingQueue');
const cardValidator = require('./card-validator');
const stateBuilder = require('./state-builder');
const constants = require('./contstants');

const eventTypes = require('./event-types');
const PLAYER_EVENTS = eventTypes.PLAYER_EVENTS;
const EVENTS = eventTypes.EVENTS;

const PHASES = constants.PHASES;
const TURN_PHASES = constants.TURN_PHASES;

class Game {
    constructor (options, rawState) {
        this._gameEvents = null;
        this._playerEvents = null;
        this.state = stateBuilder(options, rawState);
        this.started = false;

        this._cardBonus = options.cardBonus;
    }

    emit (eventName, ...args) {
        let playerEvents = Object.keys(PLAYER_EVENTS).map(eventKey => PLAYER_EVENTS[eventKey]);

        if (playerEvents.includes(eventName)) {
            let playerId = args.shift();

            if (this._playerEvents[playerId]) {
                let playerEmitter = this._playerEvents[playerId];

                playerEmitter.emit(eventName, ...args);
            } else {
                debug('no player listener found', eventName, args)
            }
        } else if (this._gameEvents){
            this._gameEvents.emit(eventName, ...args);
        } else {
            debug('no game listener found');
        }
    }

    setEventEmitters (gameEvents, playerEvents) {
        this._gameEvents = gameEvents;
        this._playerEvents = playerEvents;
    }

    get turn () {
        return this.state.turn;
    }

    get phase () {
        return this.state.phase;
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

        this.emit(EVENTS.GAME_START, {});
        this.emit(EVENTS.PHASE_CHANGE, {
            phase: this.phase
        });

        this.emit(EVENTS.TURN_CHANGE, {
            playerId: this.turn.player.id
        });

        if (this.phase === PHASES.BATTLE) {
            this.emit(EVENTS.TURN_PHASE_CHANGE, {
                phase: this.turn.phase
            });
        }

        this._turnPlayerEvents();
    }

    _turnPlayerEvents () {
        if (this.phase === PHASES.BATTLE) {
            let battle = this.turn.battle;

            if (battle) {
                let isAttacker = battle.attacker === battle.turn;
                this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.turn.id, {
                    type:  isAttacker ? 'attack' : 'defend',
                    maxDice: Math.min(isAttacker ? 3 : 2, isAttacker ? battle.attackUnits : battle.defendUnits)
                });
            } else {
                if (this.turn.phase === TURN_PHASES.PLACEMENT) {
                    this.emit(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, this.turn.player.id, {
                        availableUnits: this.availableUnits()
                    });
                } else if (this.turn.phase === TURN_PHASES.ATTACKING) {
                    this.emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, this.turn.player.id, {});
                } else if (this.turn.phase === TURN_PHASES.FORTIFYING) {
                    this.emit(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, this.turn.player.id, {});
                }
            }
        } else if (this.phase === PHASES.SETUP_A) {
            this.emit(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, this.turn.player.id, {
                availableTerritoryIds: this.board.getAvailableTerritories().map(territory => {
                    return territory.id;
                })
            });
        } else if (this.phase === PHASES.SETUP_B) {
            this.emit(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, this.turn.player.id, {
                availableUnits: this.availableUnits()
            });
        }
    }

    endTurn () {
        if (this.phase === PHASES.SETUP_A) {
            if (this.board.areAllTerritoriesOccupied()) {
                this._changePhase(PHASES.SETUP_B);
            }
        } else if (this.phase === PHASES.SETUP_B) {
            if (this._noMoreStartUnits()) {
                this._changePhase(PHASES.BATTLE);
            }
        } else if (this.phase === PHASES.BATTLE) {
            this._applyMovements();
        }

        this._nextTurn();
    }

    claimTerritory (territory) {
        if (territory.owner) {
            throw new Error('Already occupied');
        }

        this.turn.player.startUnits -= 1;
        territory.setOwner(this.turn.player, 1);

        this.emit(EVENTS.TERRITORY_CLAIMED, {
            playerId: this.turn.player.id,
            territoryId: territory.id,
            units: 1
        });

        this.endTurn();
    }

    deployOneUnit (territory) {
        if (territory.owner !== this.turn.player) {
            throw new Error('Not your territory');
        }

        if (this.turn.player.startUnits === 0) {
            throw new Error('You have no more starting units');
        }

        this.turn.player.startUnits -= 1;

        territory.addUnits(1);

        this.emit(EVENTS.DEPLOY_UNITS, {
            playerId: this.turn.player.id,
            territoryId: territory.id,
            units: 1
        });

        this.endTurn();
    }

    deployUnits (territory, units) {
        if (Number.isNaN(units) || units < 1) {
            throw new Error('Invalid number of units');
        }

        if (territory.owner !== this.turn.player) {
            throw new Error('Not your territory');
        }

        let availableUnits = this.availableUnits();

        if (availableUnits >= units && availableUnits - units > -1) {
            this.turn.unitsPlaced += units;

            territory.addUnits(units);

            this.emit(EVENTS.DEPLOY_UNITS, {
                playerId: this.turn.player.id,
                territoryId: territory.id,
                units: units
            });
        } else {
            throw new Error('No units available');
        }
    }

    attackPhase () {
        if (this.turn.player.cards.size > 4) {
            throw new Error('Player must redeem cards first');
        }

        if (this.availableUnits() !== 0) {
            throw new Error('Not all units deployed');
        }

        this._changeTurnPhase(TURN_PHASES.ATTACKING);
    }

    redeemCards (cards) {
        if (cards.length !== 3) {
            throw new Error('You must redeem 3 cards');
        }

        if (!this.turn.player.hasCards(cards)) {
            throw new Error('Player does not have these cards');
        }

        let bonus = cardValidator.getBonus(this._cardBonus, cards);

        for (let card of cards) {
            this.turn.player.removeCard(card);
            this.state.cardQueue.push(card);
        }

        this.turn.cardBonus += bonus;

        this.emit(EVENTS.REDEEM_CARDS, {
            playerId: this.turn.player.id,
            cards: cards,
            bonus: bonus
        });
    }

    attack (fromTerritory, toTerritory, units) {
        if (this.turn.battle) {
            throw new Error('Already in battle');
        }

        if (Number.isNaN(units) || units < 1) {
            throw new Error('Invalid number of units');
        }

        if (fromTerritory.owner !== this.turn.player) {
            throw new Error('Not your territory');
        }

        if (toTerritory.owner === this.turn.player) {
            throw new Error('You can not attack yourself');
        }

        if (units > fromTerritory.units - 1) {
            throw new Error('Leave at least 1 unit behind');
        }

        this.turn.battle = new Battle(fromTerritory, toTerritory, units);

        this.emit(EVENTS.ATTACK, {
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

        if (numberOfDice < 1) {
            throw new Error('Invalid number of dice');
        }

        if (battle.attacker === battle.turn) {
            let dice = battle.attackThrow(numberOfDice);

            this.emit(EVENTS.ATTACK_DICE_ROLL, {
                dice: dice
            });

            if (!battle.isBattleOver()) {
                this.emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.defender.id, {
                    type: 'defend',
                    maxDice: Math.min(2, this.turn.battle.defendUnits)
                });
            } else {
                this._endBattle();
            }
        } else if (battle.defender === battle.turn) {
            let defendResults = battle.defendThrow(numberOfDice);

            this.emit(EVENTS.DEFEND_DICE_ROLL, {
                dice: defendResults.dice,
                results: defendResults.results
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
            throw new Error('Player is not in battle');
        }
    }

    _endBattle () {
        let battle = this.turn.battle;

        if (battle.isBattleOver()) {
            this.emit(EVENTS.BATTLE_END, {
                type: battle.winner.owner === battle.attacker ? 'attack' : 'defend',
                winner: battle.winner.owner.id,
            });

            if (battle.winner.owner === this.turn.player) {
                this.turn.wonBattle = true;

                if (this._isPlayerDead(battle.defender)) {
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

        this._changeTurnPhase(TURN_PHASES.FORTIFYING);
    }

    moveUnits (fromTerritory, toTerritory, units) {
        let player = this.turn.player;

        if (Number.isNaN(units) || units < 1) {
            throw new Error('Invalid number of units');
        }

        if (fromTerritory.owner !== player || toTerritory.owner !== player) {
            throw new Error('Not your territories');
        }

        if (!fromTerritory.isAdjacentTo(toTerritory)) {
            throw new Error('Territories not adjacent');
        }

        if (fromTerritory.units - units <= 0) {
            throw new Error('Leave at least 1 unit behind');
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
        let playerCount = Array.from(this.players.values()).filter(player => !player.dead).length;

        return playerCount === 1;
    }

    winner () {
        let remainingPlayers = Array.from(this.players.values()).filter(player => !player.dead);

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
        killed.dead = true;

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

        this.emit(EVENTS.PLAYER_KILLED, {
            killer: killer.id,
            killed: killed.id,
            numerOfCardsTaken: killed.cards.size
        });
    }

    _isPlayerDead (player) {
        return player.territories.size === 0;
    }

    _changeTurnPhase (turnPhase) {
        if (this.state.phase !== PHASES.BATTLE) {
            throw new Error('Not in battle phase');
        }

        this.turn.phase = turnPhase;

        this.emit(EVENTS.TURN_PHASE_CHANGE, {
            playerId: this.turn.player.id,
            phase: this.turn.phase
        });

        this._turnPlayerEvents();
    }

    _changePhase (phase) {
        if (phase !== this.state.phase) {
            this.state.phase = phase;

            this.emit(EVENTS.PHASE_CHANGE, {
                phase: phase
            });
        }
    }

    _nextTurn () {
        let turn = this.turn;

        turn.player = this.state.playerQueue.next();

        if (this.phase === PHASES.BATTLE) {
            turn.movements = new Map();
            this._changeTurnPhase(TURN_PHASES.PLACEMENT);
            turn.battle = null;
            turn.unitsPlaced = 0;
            turn.cardBonus = 0;
            turn.wonBattle = false;
        }

        this.emit(EVENTS.TURN_CHANGE, {
            playerId: turn.player.id
        });

        this._turnPlayerEvents();
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

        this.emit(EVENTS.MOVE_UNITS, {
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
        debug('game ended', {
            winner: this.winner()
        });

        this._changePhase(PHASES.END);
    }
}

module.exports = Game;
