'use strict';

const debug = require('debug')('risk:Game');
const Player = require('./Player');
const Board = require('./Board');
const INITIAL_INFANTRY = new Map([
    [3, 35],
    [4, 30],
    [5, 25],
    [6, 20]
]);

const SETUP_PHASE = 'setup';
const COLORS = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'black'
];

class Game {
    constructor (numberOfPlayers) {
        this.infantryPerPlayer = INITIAL_INFANTRY.get(numberOfPlayers);
        this.phase = null;
        this.playerToTurn = null;
        this.board = new Board('classic');

        this.players = new Map();

        for (let i = 0; i < numberOfPlayers; i++) {
            let player = new Player(i, 'player' + i, COLORS[i]);

            debug('player created', player);

            this.players.set(player.id, player);
        }
    }

    start () {
        this.phase = SETUP_PHASE;
        this.playerToTurn = this.players.get(0);
    }

    turnToNextPlayer () {
        let currentPlayerId = this.playerToTurn.id;

        if (currentPlayerId === this.players.size - 1) {
            this.playerToTurn = this.players.get(0);
        } else {
            this.playerToTurn = this.players.get(currentPlayerId + 1);
        }

        debug('turn to next player', this.playerToTurn);
    }

    occupy (playerId, territoryId) {
        let player = this.players.get(playerId);

        if (!player) {
            throw new Error('Player does not exist');
        }

        if (player !== this.playerToTurn) {
            throw new Error('Not your turn');
        }

        let territory = this.board.getTerritoryById(territoryId);

        territory.occupy(player);

        this.turnToNextPlayer();
    }
}

module.exports = Game;
