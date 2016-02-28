'use strict';

const debug = require('debug')('risk:Game');
const Player = require('./Player');
const Board = require('./Board');
const Card = require('./Card');
const CardDeck = require('./CardDeck');

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

const TURN_PHASES = [
    'placement',
    'attacking',
    'fortifying'
];

const COLORS = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'black'
];

const BONUSES = {
    'infantry': 4,
    'cavalry': 6,
    'artillery': 8,
    'mixed': 10
};

function cardBonus(cards) {
    let first = cards[0];
    let equalType = first.type;
    let allCardsEqual = cards.every(card => {
        if (card.type === 'joker') {
            return true;
        }

        equalType = card.type;

        return card.type === first.type;
    });

    if (allCardsEqual) {
        return BONUSES[equalType];
    }

    let diffCards = [];

    for (let card of cards) {
        if (diffCards.indexOf(card.type) === -1) {
            diffCards.push(card);
        }
    }

    if (diffCards.length === 3) {
        return BONUSES['mixed'];
    }

    throw new Error('Invalid cards combination');
}

function buildCardDesk(territories) {
    let territoryIds = territories.map(territory => territory.id);
    let deck = new CardDeck();

    for (let type of Card.TYPES) {
        if (type === 'joker') {
            deck.push(new Card('joker'));
            deck.push(new Card('joker'));
        } else {
            for (let i = 0; i < 14; i++) {
                deck.push(new Card(type, territoryIds.shift()));
            }
        }
    }

    deck.shuffle();

    debug('card deck created', deck.toString());

    return deck;
}

class Game {
    constructor (numberOfPlayers) {
        this.infantryPerPlayer = INITIAL_INFANTRY.get(numberOfPlayers);
        this.phase = null;
        this.playerToTurn = null;
        this.turnPhase = null;
        this.turnCardBonus = 0;
        this.board = new Board('classic');
        this.desk = buildCardDesk(Array.from(this.board.territories.values()));

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

        this.turnCardBonus = 0;

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

    playerContinents (playerId) {
        let player = this.getPlayerById(playerId);
        let continents = this.board.getPlayerContinents(player);

        return continents;
    }

    playerAvailableUnits (playerId) {
        let player = this.getPlayerById(playerId);

        let territories = this.board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        let continents = this.board.getPlayerContinents(player);
        let coninentBonus = coninents.reduce((totalBonus, continent) => {
            return totalBonus + continent.bonus;
        }, 0);

        return territoryBonus + continentBonus + this.turnCardBonus;
    }

    redeemCards (cards) {
        if (cards.length !== 3) {
            throw new Error('You must redeem 3 cards');
        }

        let bonus = cardBonus(cards);

        this.turnCardBonus = bonus;
    }
}

module.exports = Game;
