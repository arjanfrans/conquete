'use strict';

const Queue = require('./Queue');
const RotatingQueue = require('./RotatingQueue');
const Territory = require('./Territory');
const Continent = require('./Continent');
const Player = require('./Player');
const Board = require('./Board');

class State {
    constructor (rawState) {
        this.cards = rawState.cards;
        this.cardQueue = new Queue(rawState.cardQueue || this.cards);
        this.players = this._loadPlayers(rawState.players);
        this.board = this._loadBoard(rawState.board);

        this._territoryOwners(rawState.board.territories, rawState.players);

        this.playerQueue = new RotatingQueue(Array.from(this.players.values()));
        this.phase = rawState.phase;
        this.turn = rawState.turn || {};
    }

    _territoryOwners (rawTerritories, rawPlayers) {
        for (let rawTerritory of rawTerritories) {
            for (let rawPlayer of rawPlayers) {
                if (rawPlayer.territoryIds && rawPlayer.territoryIds.includes(rawTerritory.id)) {
                    let territory = this.board.territories.get(rawTerritory.id);
                    let player = this.players.get(rawPlayer.id);

                    territory.setOwner(player, rawTerritory.units);
                    player.territories.add(territory);
                }
            }
        }
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



            territories.set(territory.id, territory);

            let continent = continents.get(rawTerritory.continentId);

            if (!continent) {
                throw new Error('Invalid continent id for territory: ' + rawTerritory.id);
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
    }

    _loadPlayers (rawPlayers) {
        let players = new Map();

        rawPlayers.map((rawPlayer, index) => {
            let player = new Player(rawPlayer.id || index, rawPlayer.name);

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
