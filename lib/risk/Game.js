'use strict';

const debug = require('debug')('risk:Game');
const Player = require('./Player');
const Board = require('./Board');
const Battle = require('./Battle');
const RotatingQueue = require('./RotatingQueue');
const territoryCards = require('./territory-cards');

const INITIAL_UNITS = new Map([
    [3, 35],
    [4, 30],
    [5, 25],
    [6, 20]
]);

const PHASES = [
    'setupA',
    'setupB',
    'battle'
];

const COLORS = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'black'
];

const PHASES = {
    SETUP_A: 'setup_a',
    SETUP_B: 'setup_b',
    BATTLE: 'battle'
};

const TURN_PHASES = {
    PLACEMENT: 'placement',
    ATTACKING: 'attacking',
    FORTIFYING: 'fortifying'
};

class Game {
    constructor (players, options) {
        if (players.length > 6) {
            throw new Error('Too many players');
        }

        if (players.length < 3) {
            throw new Error('Not enough players');
        }

        this.turn = {};
        this.phase = PHASES.SETUP_A;
        this.players = new Map();
        this.deadPlayers = new Map();

        let startUnits = INITIAL_UNITS.get(players.length);

        players.forEach((playerData, index) => {
            let player = new Player(index, playerData.name, COLORS[index]);

            player.startUnits = startUnits;

            this.players.set(player.id, player);
        });

        this.board = new Board(options.mode);
        this.cardSet = territoryCards(options.cards);

        let territoryIds = Array.from(this.board.territories.values()).map(territory => {
            return territory.id;
        });

        this.cardDeck = territoryCards.createDeck(territoryIds);
        this.playerQueue = new RotatingQueue(Array.from(this.players.values()));

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
        }

        this._nextTurn();
    }

    claimTerritory (territory) {
        territory.occupy(player);

        this.endTurn();
    }

    deployOneUnit (territory) {
        if (territory.occupyingPlayer !== player) {
            throw new Error('Not your territory');
        }

        if (player.startUnits === 0) {
            throw new Error('You have no more starting units');
        }

        player.startUnits -= 1;
        territory.addUnits(1);

        this.endTurn();
    }

    deployUnits (territory, units) {
        if (units < -1) {
            throw new Error('Negative number of units');
        }

        if (territory.occupyingPlayer !== this.turn.player) {
            throw new Error('Not your territory');
        }

        let availableUnits = this._availableUnits();

        if (availableUnits - units > -1) {
            this.turn.unitsPlaced += units;

            territory.addUnits(units);

            debug('units placed', territory.id, units);

        } else {
            throw new Error('No units available');
        }
    }

    attackPhase () {
        if (player.cards.size > 4) {
            throw new Error('Player must redeem cards first');
        }

        if (this._availableUnits() !== 0) {
            throw new Error('Not all units deployed');
        }

        this._changeTurnPhase(TURN_PHASES.ATTACK);
    }

    redeemCards (cards) {
        if (cards.length !== 3) {
            throw new Error('You must redeem 3 cards');
        }

        if (!this.turn.player.hasCards(cards)) {
            throw new Error('Player does not have these cards');
        }

        let bonus = this.cardSet.cardBonus(cards);

        for (let card of cards) {
            this.turn.player.removeCard(card);
            this.cardDeck.push(card);
        }

        this.turn.cardBonus += bonus;

        debug('cards redeemed', cards);
    }

    attack (fromTerritory, toTerritory, units) {
        if (fromTerritory.occupyingPlayer !== this.turn.player) {
            throw new Error('Not your territory');
        }

        if (toTerritory.occupyingPlayer === this.turn.player) {
            throw new Error('You can not attack yourself');
        }

        if (units > fromTerritory.units - 1) {
            throw new Error('Leave at least 1 unit behind');
        }

        this.battle = new Battle(fromTerritory, toTerritory, units);
    }

    rollDice (numberOfDice) {
        let battle = this.turn.battle;

        if (this.turn.player === battle.attacker) {
            battle.attackThrow(numberOfDice);
        } else if (player === battle.defender) {
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

            this.battle = null;

            if (this.isGameOver()) {
                this._endGame();
            }
        }
    }

    fortifyPhase () {
        this._changeTurnPhase(TURN_PHASES.FORTIFYING);
    }

    moveUnits (fromTerritory, toTerritory, units) {
        let player = this.turn.player;

        if (fromTerritory.occupyingPlayer !== player || to.occupyingPlayer !== player) {
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

        this.turnMovements.set(fromTerritory, move);

        debug('queued move', move.from.id, move.to.id, move.units);
    }

    isGameOver () {
        return this.players.size === 1;
    }

    _noMoreStartUnits () {
        return Array.from(this.players.values()).every(player => {
            return player.startUnits === 0;
        });
    }

    _killPlayer (killer, killed) {
        this.players.delete(killed.id);
        this.playerQueue.remove(killed);
        this.deadPlayers.set(killed.id, killed);

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
        if (this.phase !== PHASES.BATTLE) {
            throw new Error('Not in battle phase');
        }

        this.turn.phase = turnPhase;

        debug('changed turn phase to: %s', turnPhase);
    }

    _changePhase (phase) {
        if (phase !== this.phase) {
            this.phase = phase;

            debug('changing phase to: %s', this.phase);
        }
    }

    _nextTurn () {
        this.turn.player = this.playerQueue.next();

        if (this.phase === PHASES.BATTLE) {
            this.turn.movements = new Map();
            this.turn.phase = TURN_PHASES.PLACEMENT;
            this.turn.battle = null;
            this.turn.unitsPlaced = 0;
            this.turn.cardBonus = 0;
            this.turn.wonBattle = false;
        }

        debug('turn to next player: %o', this.turn.player);
    }

    _availableUnits () {
        let player = this.turn.player;
        let territories = this.board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        let continents = this.board.getPlayerContinents(player);
        let continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.bonus;
        }, 0);

        return territoryBonus + continentBonus + this.turnCardBonus - this.turnPlacedUnits;
    }

    _applyMovements () {
        for (let move of this.turn.movements.values()) {
            move.from.units -= move.units;
            move.to.units += move.units;
        }

        this.turnMovements.clear();
    }

    _grabCard () {
        let card = this.cardDeck.pop();

        this.turn.player.addCard(card);

        debug('grabbing new card: %o', card);
    }

    _endGame () {
        debug('game ended');
    }
}

module.exports = Game;
