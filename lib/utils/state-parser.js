'use strict';

const RotatingQueue = require('./RotatingQueue');
const CardManager = require('../CardManager');
const Territory = require('../Territory');
const Continent = require('../Continent');
const Player = require('../Player');
const Board = require('../Board');
const Battle = require('../Battle');
const State = require('../State');

function parsePlayers (rawPlayers) {
    const players = new Map();

    rawPlayers.map(rawPlayer => {
        const player = Player.create({
            id: rawPlayer.id,
            startUnits: rawPlayer.startUnits
        });

        if (rawPlayer.cards) {
            rawPlayer.cards.forEach(card => player.addCard(card));
        }

        players.set(player.getId(), player);
    });

    return players;
}

function parseTurn ({ rawTurn, players, board }) {
    const player = rawTurn.player !== null ? players.get(rawTurn.player) : null;
    let battle = null;

    if (rawTurn.battle) {
        const from = board.getTerritoryById(rawTurn.battle.from);
        const to = board.getTerritoryById(rawTurn.battle.to);

        battle = Battle.create({
            from,
            to,
            units: rawTurn.battle.attacker.initialUnits,
            turn: players.get(rawTurn.battle.turn)
        });

        battle.setRemainingAttackUnits(rawTurn.battle.attacker.units);
        battle.setRemainingDefendUnits(rawTurn.battle.defender.units);
        battle.setAttackDice(rawTurn.battle.attacker.dice || []);
        battle.setDefendDice(rawTurn.battle.defender.dice || []);
    }

    const turn = {
        movements: new Map(rawTurn.movements.map(rawMove => {
            const move = {
                from: board.territories.get(rawMove[1].from),
                to: board.territories.get(rawMove[1].to),
                units: rawMove[1].units
            };

            return [rawMove[0], move];
        })),
        phase: rawTurn.phase,
        player: player,
        unitsPlaced: rawTurn.unitsPlaced,
        cardBonus: rawTurn.cardBonus,
        battle: battle,
        wonBattle: rawTurn.wonBattle
    };

    return turn;
}

function parseBoard (rawBoard) {
    const territories = new Map();
    const continents = new Map();

    for (const rawContinent of rawBoard.continents) {
        const continent = Continent.create({
            id: rawContinent.id,
            name: rawContinent.name,
            bonus: rawContinent.bonus
        });

        continents.set(continent.getId(), continent);
    }

    for (const rawTerritory of rawBoard.territories) {
        const territory = Territory.create({
            id: rawTerritory.id,
            name: rawTerritory.name
        });

        territories.set(territory.getId(), territory);

        const continent = continents.get(rawTerritory.continentId);

        if (!continent) {
            throw new Error('Invalid continent id for territory: ' + rawTerritory.id);
        }

        territory.setContinent(continent);

        continent.addTerritory(territory);
    }

    for (const rawTerritory of rawBoard.territories) {
        const territory = territories.get(rawTerritory.id);

        rawTerritory.adjacentTerritoryIds.forEach(id => {
            const adjacentTerritory = territories.get(id);

            if (!adjacentTerritory) {
                throw new Error('Invalid adjacent territory id: ' + id);
            }

            territory.addAdjacentTerritory(adjacentTerritory);
        });
    }

    const board = Board.create({ territories, continents });

    return board;
}

function addTerritoryOwners ({ rawTerritories, rawPlayers, board, players }) {
    for (const rawTerritory of rawTerritories) {
        for (const rawPlayer of rawPlayers) {
            if (rawPlayer.territoryIds && rawPlayer.territoryIds.includes(rawTerritory.id)) {
                const territory = board.getTerritoryById(rawTerritory.id);
                const player = players.get(rawPlayer.id);

                territory.setOwner(player);
                territory.setUnits(rawTerritory.units);
                player.addTerritory(territory);
            }
        }
    }
}

function parse (rawState) {
    const players = parsePlayers(rawState.players);
    const board = parseBoard(rawState.board);
    let playerQueue = null;

    if (rawState.playerQueue) {
        const rawPlayerQueue = rawState.playerQueue.map(playerId => {
            return players.get(playerId);
        });

        playerQueue = RotatingQueue.create({ items: rawPlayerQueue });
    } else {
        playerQueue = RotatingQueue.create({ items: Array.from(players.values()) });
    }

    addTerritoryOwners({
        rawTerritories: rawState.board.territories,
        rawPlayers: rawState.players,
        players,
        board
    });

    const turn = parseTurn({ rawTurn: rawState.turn, board, players });

    const cardManager = CardManager.create({
        cards: rawState.cardManager.cards.slice(),
        queueCards: rawState.cardManager.queueCards,
        bonusOptions: rawState.cardManager.bonusOptions,
        cardTypes: rawState.cardManager.cardTypes,
        jokerCard: rawState.cardManager.jokerCard
    });

    const state = State.create({
        turnCount: rawState.turnCount,
        cardManager,
        players,
        playerQueue,
        board,
        phase: rawState.phase,
        turn
    });

    state.setTurnCount(rawState.turnCount);
    state.setPreviousTurnEvent(rawState.previousTurnEvent);
    state.setPreviousPlayerEvent(rawState.previousPlayerEvent);

    return state;
}

module.exports = { parse };
