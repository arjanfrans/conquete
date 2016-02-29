'use strict';

const debug = require('debug')('risk:Game');
const Player = require('./Player');
const Board = require('./Board');
const Card = require('./Card');
const CardDeck = require('./CardDeck');
const Battle = require('./Battle');
const RotatingQueue = require('./RotatingQueue');

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

const CARDS = new Map();

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
            let joker0 = new Card('joker_0', 'joker');
            let joker1 = new Card('joker_1', 'joker');

            deck.push(joker0);
            deck.push(joker1);

            CARDS.set(joker0.id, joker0);
            CARDS.set(joker1.id, joker1);
        } else {
            for (let i = 0; i < 14; i++) {
                let territoryId = territoryIds.shift();
                let id = type + '_' + territoryId;
                let card = new Card(id, type, territoryId);

                deck.push(card);

                CARDS.set(card.id, card);
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
        this.turnPlacedUnits = 0;
        this.turnWonBattle = false;
        this.turnMovements = new Map();
        this.battle = null;
        this.board = new Board('classic');
        this.deck = buildCardDesk(Array.from(this.board.territories.values()));

        this.players = new Map();
        this.deadPlayers = new Map();

        for (let i = 0; i < numberOfPlayers; i++) {
            let player = new Player(i, 'player' + i, COLORS[i]);

            player.startUnits = this.infantryPerPlayer;

            debug('player created', player.toString());

            this.players.set(player.id, player);
        }

        this.playerQueue = new RotatingQueue(Array.from(this.players.values()));
    }

    start () {
        this.phase = PHASES[0];
        this.playerToTurn = this.playerQueue.next();
    }

    turnToNextPlayer () {
        if (this.phase === 'setupA') {
            if (this.board.areAllTerritoriesOccupied()) {
                this.phase = 'setupB';

                debug('Changed phase', 'setupB');
            }
        }

        if (this.phase === 'setupB') {
            if (this.noMoreStartUnits()) {
                this.phase = 'battle';

                debug('Changed phase', 'battle');
            }
        }

        if (this.phase === 'battle') {
            this.turnPhase = 'placement';

            debug('turn phase', 'placement');
        }

        this.playerToTurn = this.playerQueue.next();

        debug('turn to next player', this.playerToTurn.toString());
    }

    _grabCard () {
        let card = this.deck.pop();

        this.playerToTurn.addCard(card);

        debug('grabbing new card', card.toString());
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

    placeUnits (playerId, units, territoryId) {
        let player = this.getPlayerById(playerId);
        let territory = this.board.getTerritoryById(territoryId);

        if (territory.occupyingPlayer !== player) {
            throw new Error('Not your territory');
        }

        debug('attempt to place units', units)
        if ((this.playerAvailableUnits(playerId)) - units > -1) {
            this.turnPlacedUnits += units;
            territory.addUnits(units);

            debug('units placed', territory.id, units);
        } else {
            throw new Error('No units available');
        }
    }

    nextTurnPhase (playerId) {
        let player = this.getPlayerById(playerId);

        if (this.turnPhase === 'placement') {
            if (this.playerAvailableUnits(player.id) !== 0) {
                throw new Error('Not all units placed');
            }

            if (player.cards.size > 4) {
                throw new Error('Player must redeem cards');
            }

            this.turnPhase = 'attacking';
        } else  if (this.turnPhase === 'attacking') {
            this.turnPhase = 'fortifying';
        }

        debug('turn phase', this.turnPhase);
    }

    noMoreStartUnits () {
        return Array.from(this.players.values()).every(player => {
            return player.startUnits === 0;
        });
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
        let continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.bonus;
        }, 0);

        return territoryBonus + continentBonus + this.turnCardBonus - this.turnPlacedUnits;
    }

    attack (playerId, fromId, toId, units) {
        let player = this.getPlayerById(playerId);

        if (player !== this.playerToTurn) {
            throw new Error('Not your turn');
        }

        let from = this.board.getTerritoryById(fromId);
        let to = this.board.getTerritoryById(toId);

        if (from.occupyingPlayer !== player) {
            throw new Error('Not your territory');
        }

        if (to.occupyingPlayer === player) {
            throw new Error('You can not attack yourself');
        }

        if (units > from.units - 1) {
            throw new Error('Leave at least 1 unit behind');
        }

        this.battle = new Battle(from, to, units);
    }

    moveTroops (playerId, fromId, toId, units) {
        let player = this.getPlayerById(playerId);

        if (player !== this.playerToTurn) {
            throw new Error('Not your turn');
        }

        let from = this.board.getTerritoryById(fromId);
        let to = this.board.getTerritoryById(toId);

        if (from.occupyingPlayer !== player || to.occupyingPlayer !== player) {
            throw new Error('Not your territories');
        }

        if (!from.isAdjacentTo(to)) {
            throw new Error('Territories not adjacent');
        }

        if (from.units - units <= 0) {
            throw new Error('Leave at least 1 unit behind');
        }

        let move = {
            from: from,
            to: to,
            units: units
        };

        this.turnMovements.set(from, move);

        debug('queued move', move.from.id, move.to.id, move.units);
    }

    endTurn (playerId) {
        let player = this.getPlayerById(playerId);

        if (player !== this.playerToTurn) {
            throw new Error('Not your turn');
        }

        if (this.turnWonBattle) {
            this._grabCard();
        }

        this._applyMovements();

        this.turnPlacedUnits = 0;
        this.turnCardBonus = 0;
        this.turnWonBattle = false;

        debug('ending turn');

        this.turnToNextPlayer();
    }

    _applyMovements () {
        for (let move of this.turnMovements.values()) {
            move.from.units -= move.units;
            move.to.units += move.units;
        }

        this.turnMovements.clear();
    }

    roll (playerId, numberOfDice) {
        if (!this.battle) {
            throw new Error('No battle in progress');
        }

        let player = this.getPlayerById(playerId);

        if (player === this.battle.attacker) {
            this.battle.attackThrow(numberOfDice);
        } else if (player === this.battle.defender) {
            this.battle.defendThrow(numberOfDice);
        } else {
            throw new Error('Player is not in battle');
        }

        if (this.battle.isBattleOver()) {
            if (this.battle.winner.occupyingPlayer === this.playerToTurn) {
                this.turnWonBattle = true;

                if (this.isPlayerDead(this.battle.defender)) {
                    this.players.delete(this.battle.defender.id);
                    this.playerQueue.remove(this.battle.defender);

                    debug('player dead', this.battle.defender.toString());

                    this.deadPlayers.set(this.battle.defender.id, this.battle.defender);
                }
            }

            this.battle = null;

            if (this.isGameOver()) {
                this._endGame();
            }
        }
    }

    _endGame () {
        debug('game ended');
    }

    isPlayerDead (player) {
        let territories = this.board.getPlayerTerritories(player);
        debug('isplayerdead', territories.length, player.id);

        if (territories.length <= 0) {
            return true;
        }

        return false;
    }

    isGameOver () {
        if (this.players.size === 1) {
            return true;
        }

        return false;
    }

    redeemCards (playerId, cardIds) {
        let player = this.getPlayerById(playerId);

        if (player !== this.playerToTurn) {
            throw new Error('Not your turn');
        }

        if (cardIds.length !== 3) {
            throw new Error('You must redeem 3 cards');
        }

        let cards = cardIds.map(cardId => CARDS.get(cardId));

        if (!this.playerToTurn.hasCards(cards)) {
            throw new Error('Player does not have these cards');
        }

        let bonus = cardBonus(cards);

        for (let card of cards) {
            player.removeCard(card);
            this.deck.push(card);
        }

        this.turnCardBonus += bonus;

        debug('cards redeemed', cards);
    }

    isValidCardCombination (cardIds) {
        let cards = cardIds.map(cardId => CARDS.get(cardId));

        try {
            cardBonus(cards);

            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = Game;
