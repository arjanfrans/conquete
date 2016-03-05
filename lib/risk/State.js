'use strict';

const Queue = require('./Queue');
const RotatingQueue = require('./RotatingQueue');
const Territory = require('./Territory');
const Continent = require('./Continent');
const Board = require('./Board');

class State {
    constructor (rawState) {
        this.cards = rawState.cards;
        this.cardQueue = new Queue(rawState.cardQueue || this.cards);
        this.players = this._loadPlayers(rawState.players);
        this.playerQueue = new RotatingQueue(Array.from(this.players.values());
        this.board = this._loadBoard(rawState.board);
        this.phase = rawState.phase;
        this.turn = rawState.turn || {};
    }

    _loadBoard (rawBoard) {
        let territories = new Map();
        let continents = new Map();

        for (let rawContinent of rawBoard.continents) {
            let continent = new Continent(rawContinent.id, rawContinent.name, rawContinent.bonus);

            continents.set(continent.id, continent);
        }

        for (let rawTerritory of rawBoard.territories) {
            let territory = new Territory(rawTerritory.id, rawTerritory.name);

            territory.owner = rawTerritory.owner || territory.owner;
            territory.units = rawTerritory.units || territory.units;

            territories.set(territory.id, territory);

            let continent = continents.get(rawTerritory.continentId);

            if (!continent) {
                throw new Error('Invalid continent id for territory: ' rawTerritory.id);
            }

            territory.continent = continent;
        };

        for (let rawTerritory of rawBoard.territories) {
            let territory = territories.get(rawTerritory.id);

            rawTerritory.adjacentTerritoryIds.forEach(id => {
                let adjacentTerritory = territories.get(id);

                if (!adjacentTerritory) {
                    throw new Error('Invalid adjacent territory id: ' + id);
                }

                territory.addAdjacentTerritory(adjacentTerritory);
            });
        };

        return new Board(territories, continents);
    },

    _loadPlayers (rawPlayers) {
        let players = new Map();

        rawPlayers.map(rawPlayer => {
            let player = new Player(rawPlayer.id, rawPlayer.name);

            player.startUnits = rawPlayer.startUnits || player.startUnits;
            player.dead = rawPlayer.dead || player.dead;

            if (rawPlayer.cards) {
                rawPlayer.cards.forEach(card => player.addCard(card));
            }

            players.set(player.id, player);
        });

        return players;
    }
}

module.exports = State;
