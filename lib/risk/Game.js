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

class Game {
    constructor (numberOfPlayers) {
        this.infantryPerPlayer = INITIAL_INFANTRY.get(numberOfPlayers);
        this.phase = null;
        this.playerToTurn = null;
        this.board = new Board('classic');

        this.players = new Map();

        for (let i = 0; i < numberOfPlayers; i++) {
            let player = new Player(i, 'player' + i, COLORS[i]);

            player.startUnits = this.infantryPerPlayer;

            debug('player created', player.toString());

            this.players.set(player.id, player);
        }
    }

    start () {
        this.phase = PHASES[0];
        this.playerToTurn = this.players.get(0);
    }

    turnToNextPlayer () {
        let currentPlayerId = this.playerToTurn.id;

        if (currentPlayerId === this.players.size - 1) {
            this.playerToTurn = this.players.get(0);
        } else {
            this.playerToTurn = this.players.get(currentPlayerId + 1);
        }

        debug('turn to next player', this.playerToTurn.toString());
    }

    getPlayerById (playerId) {
        let player = this.players.get(playerId);

        if (!player) {
            throw new Error('Player does not exist');
        }

        return player;
    }

    occupy (playerId, territoryId) {
        let player = this.getPlayerById(playerId);

        if (player !== this.playerToTurn) {
            throw new Error('Not your turn');
        }

        let territory = this.board.getTerritoryById(territoryId);

        territory.occupy(player);

        this.turnToNextPlayer();
    }

    deployOneUnit (playerId, territoryId) {
        let player = this.getPlayerById(playerId);
        let territory = this.board.getTerritoryById(territoryId);

        if (territory.occupyingPlayer !== player) {
            throw new Error('Not your territory');
        }

        if (player.startUnits === 0) {
            throw new Error('You have no more starting units');
        }

        player.startUnits -= 1;
        territory.addUnits(1);

        this.turnToNextPlayer();
    }

    noMoreStartUnits () {
        return Array.from(this.players.values()).every(player => {
            return player.startUnits === 0;
        });
    }

    changePhase (phase) {
        if (this.phase === 'setupA' && !this.board.areAllTerritoriesOccupied()) {
            throw new Error('Not all territories are occupied');
        }

        this.phase = phase;

        debug('changed phase', phase);
    }

    playerTerritories (playerId) {
        let player = this.getPlayerById(playerId);
        let territories = this.board.getPlayerTerritories(player);

        return territories;
    }
}

module.exports = Game;
