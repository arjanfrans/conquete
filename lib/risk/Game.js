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

const COLORS = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'black'
];

class Game {
    constructor (players, options) {
        if (players.length > 6) {
            throw new Error('Too many players');
        }

        if (players.length < 3) {
            throw new Error('Not enough players');
        }

        this.started = false;
        this.turn = {};
        this.phase = null;
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

        let deck = this.cardSet.createDeck(territoryIds);

        this.cards = deck.cards;
        this.deck = deck.deck;

        this.playerQueue = new RotatingQueue(Array.from(this.players.values()));
    }

    static get PHASES () {
        return {
            SETUP_A: 'setup_a',
            SETUP_B: 'setup_b',
            BATTLE: 'battle',
            END: 'end'
        };
    }

    static get TURN_PHASES () {
        return {
            PLACEMENT: 'placement',
            ATTACKING: 'attacking',
            FORTIFYING: 'fortifying'
        };
    }

    start () {
        this.started = true;
        this.playerQueue.shuffle();
        this.phase = Game.PHASES.SETUP_A;

        debug('game started');

        this._nextTurn();
    }

    endTurn () {
        if (this.phase === Game.PHASES.SETUP_A) {
            if (this.board.areAllTerritoriesOccupied()) {
                this._changePhase(Game.PHASES.SETUP_B);
            }
        } else if (this.phase === Game.PHASES.SETUP_B) {
            if (this._noMoreStartUnits()) {
                this._changePhase(Game.PHASES.BATTLE);
            }
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
        if (units < -1) {
            throw new Error('Negative number of units');
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

        this._changeTurnPhase(Game.TURN_PHASES.ATTACKING);
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
            this.deck.push(card);
        }

        this.turn.cardBonus += bonus;

        debug('cards redeemed', {
            cards: cards.map(card => card.id)
        });
    }

    attack (fromTerritory, toTerritory, units) {
        if (this.turn.battle) {
            throw new Error('Already in battle');
        }

        if (units < -1) {
            throw new Error('Negative number of units');
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
            defender: toTerritory.occupyingPlayer.id
        });
    }

    rollDice (numberOfDice) {
        let battle = this.turn.battle;

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

        this._changeTurnPhase(Game.TURN_PHASES.FORTIFYING);
    }

    moveUnits (fromTerritory, toTerritory, units) {
        let player = this.turn.player;

        if (units < -1) {
            throw new Error('Negative number of units');
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

        debug('queued move', move.from.id, move.to.id, move.units);
    }

    isGameOver () {
        return this.players.size === 1;
    }

    winner () {
        if (this.players.size === 1) {
            return Array.from(this.players.values())[0]
        }

        return null;
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
        if (this.phase !== Game.PHASES.BATTLE) {
            throw new Error('Not in battle phase');
        }

        this.turn.phase = turnPhase;

        debug('changed turn phase to: %s', turnPhase);
    }

    _changePhase (phase) {
        if (phase !== this.phase) {
            debug('changing phase', { previousPhase: this.phase, newPhase: phase });

            this.phase = phase;
        }
    }

    _nextTurn () {
        this.turn.player = this.playerQueue.next();

        if (this.phase === Game.PHASES.BATTLE) {
            this.turn.movements = new Map();
            this._changeTurnPhase(Game.TURN_PHASES.PLACEMENT);
            this.turn.battle = null;
            this.turn.unitsPlaced = 0;
            this.turn.cardBonus = 0;
            this.turn.wonBattle = false;
        }

        debug('turn to next player', { player: this.turn.player.id });
    }

    availableUnits () {
        let player = this.turn.player;
        let territories = this.board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        let continents = this.board.getPlayerContinents(player);
        let continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.bonus;
        }, 0);

        return territoryBonus + continentBonus + this.turn.cardBonus - this.turn.unitsPlaced;
    }

    _applyMovements () {
        for (let move of this.turn.movements.values()) {
            move.from.units -= move.units;
            move.to.units += move.units;
        }

        this.turnMovements.clear();
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

        this._changePhase(Game.PHASES.END);
    }
}

module.exports = Game;
