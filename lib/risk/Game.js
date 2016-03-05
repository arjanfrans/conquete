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

const PHASES = constants.PHASES;
const TURN_PHASES = constants.TURN_PHASES;

class Game {
    constructor (options, rawState) {
        this.state = stateBuilder(options, rawState);
        this.started = false;

        this._cardBonus = options.cardBonus;
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
        this.state.playerQueue.shuffle();
        this._changePhase(PHASES.SETUP_A);

        debug('game started');

        this._nextTurn();
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
        territory.occupy(this.turn.player);

        this.turn.player.startUnits -= 1;

        debug('territory claimed', {
            player: this.turn.player.id,
            territory: territory.id
        });

        this.endTurn();
    }

    deployOneUnit (territory) {
        if (territory.occupyingPlayer !== this.turn.player) {
            throw new Error('Not your territory');
        }

        if (this.turn.player.startUnits === 0) {
            throw new Error('You have no more starting units');
        }

        this.turn.player.startUnits -= 1;

        territory.addUnits(1);

        debug('1 unit added to territory', {
            territory: territory.id,
            player: this.turn.player.id
        });

        this.endTurn();
    }

    deployUnits (territory, units) {
        if (Number.isNaN(units) || units < 1) {
            throw new Error('Invalid number of units');
        }

        if (territory.occupyingPlayer !== this.turn.player) {
            throw new Error('Not your territory');
        }

        let availableUnits = this.availableUnits();

        if (availableUnits >= units && availableUnits - units > -1) {
            this.turn.unitsPlaced += units;

            territory.addUnits(units);

            debug('units placed', {
                player: this.turn.player.id,
                territory: territory.id,
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

        let bonus = cardValidator.getBonus(cards);

        for (let card of cards) {
            this.turn.player.removeCard(card);
            this.deck.push(card);
        }

        this.turn.cardBonus += bonus;

        debug('cards redeemed', {
            player: this.turn.player.id,
            cards: cards.map(card => card.id)
        });
    }

    attack (fromTerritory, toTerritory, units) {
        if (this.turn.battle) {
            throw new Error('Already in battle');
        }

        if (Number.isNaN(units) || units < 1) {
            throw new Error('Invalid number of units');
        }

        if (fromTerritory.occupyingPlayer !== this.turn.player) {
            throw new Error('Not your territory');
        }

        if (toTerritory.occupyingPlayer === this.turn.player) {
            throw new Error('You can not attack yourself');
        }

        if (units > fromTerritory.units - 1) {
            throw new Error('Leave at least 1 unit behind');
        }

        this.turn.battle = new Battle(fromTerritory, toTerritory, units);

        debug('attack initiated', {
            from: fromTerritory.id,
            to: toTerritory.id,
            attacker: this.turn.player.id,
            defender: toTerritory.occupyingPlayer.id,
            units: units
        });
    }

    rollDice (numberOfDice) {
        let battle = this.turn.battle;

        if (numberOfDice < 1) {
            throw new Error('Invalid number of dice');
        }


        if (this.turn.player === battle.turn) {
            battle.attackThrow(numberOfDice);
        } else if (battle.defender === battle.turn) {
            battle.defendThrow(numberOfDice);
        } else {
            throw new Error('Player is not in battle');
        }

        if (battle.isBattleOver()) {
            if (battle.winner.occupyingPlayer === this.turn.player) {
                this.turn.wonBattle = true;

                if (this._isPlayerDead(battle.defender)) {
                    this._killPlayer(battle.attacker, battle.defender);
                }
            }

            this.turn.battle = null;

            if (this.isGameOver()) {
                this._endGame();
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

        if (fromTerritory.occupyingPlayer !== player || toTerritory.occupyingPlayer !== player) {
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

        this.turn.movements.set(fromTerritory, move);

        debug('queued move', {
            from: move.from.id,
            to: move.to.id,
            units: move.units,
            player: player.id
        });
    }

    isGameOver () {
        let playerCount = Array.from(this.players.values()).filter(player => !player.dead);

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
        let player = this.players.get(killed.id);

        player.dead = true;

        this.playerQueue.remove(killed);

        // Get cards from the killed player
        let takenCards = [];

        for (let card of killed.cards) {
            killer.addCard(card);
            killed.removeCard(card);
            takenCards.push(card.id);
        }

        debug('player killed: %o', {
            killer: killer.id,
            killed: killed.id,
            takenCards: takenCards
        });
    }

    _isPlayerDead (player) {
        let territories = this.board.getPlayerTerritories(player);

        return territories.length === 0;
    }

    _changeTurnPhase (turnPhase) {
        if (this.state.phase !== PHASES.BATTLE) {
            throw new Error('Not in battle phase');
        }

        debug('changing turn phase', {
            previousPhase: this.state.turn.phase,
            newPhase: turnPhase
        });

        this.turn.phase = turnPhase;
    }

    _changePhase (phase) {
        if (phase !== this.state.phase) {
            debug('changing phase', {
                previousPhase: this.state.phase,
                newPhase: phase });

            this.state.phase = phase;
        }
    }

    _nextTurn () {
        let turn = this.turn;

        turn.player = this.state.playerQueue.next();

        if (this.phase === PHASES.BATTLE) {
            turn.movements = new Map();
            _changeTurnPhase(TURN_PHASES.PLACEMENT);
            turn.battle = null;
            turn.unitsPlaced = 0;
            turn.cardBonus = 0;
            turn.wonBattle = false;
        }

        debug('turn to next player', { player: turn.player.id });
    }

    availableUnits (player) {
        player = player || this.turn.player;

        if ([PHASES.SETUP_A, PHASES.SETUP_B].includes(this.phase) {
            return player.startUnits;
        }

        let territories = this.board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        let continents = this.board.getPlayerContinents(player);
        let continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.bonus;
        }, 0);

        let cardBonus = this.turn.player === player ? this.turn.cardBonus : 0;
        let unitsPlaced = this.turn.player === player ? this.turn.unitsPlaced : 0;

        debug('available units', {
            territoryBonus: territoryBonus,
            continentBonus: continentBonus,
            cardBonus: cardBonus,
            total: territoryBonus + continentBonus + cardBonus
        });

        return territoryBonus + continentBonus + cardBonus - unitsPlaced;

    }

    _applyMovements () {
        for (let move of this.turn.movements.values()) {
            move.from.units -= move.units;
            move.to.units += move.units;
        }

        this.turn.movements.clear();
    }

    _grabCard () {
        let card = this.deck.pop();

        this.turn.player.addCard(card);

        debug('grabbing new card', {
            player: this.turn.player.id,
            card: card.id
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
