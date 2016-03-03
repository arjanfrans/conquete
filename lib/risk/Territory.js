'use strict';

const debug = require('debug')('risk:Territory');

class Territory {
    constructor (id, name) {
        this.id = id;
        this.name = name;
        this.occupyingPlayer = null;
        this.adjacentTerritories = new Map();
        this.continent = null;
        this.units = 0;
    }

    addAdjacentTerritory (territory) {
        this.adjacentTerritories.set(territory.id, territory);
    }

    isAdjacentTo (territory) {
        return this.adjacentTerritories.has(territory.id);
    }

    ownAdjacentTerritories () {
        let territories = Array.from(this.adjacentTerritories.values());

        return territories.filter(territory => {
            return territory.occupyingPlayer === this.occupyingPlayer;
        });

    }

    enemyAdjacentTerritories () {
        let territories = Array.from(this.adjacentTerritories.values());

        return territories.filter(territory => {
            return territory.occupyingPlayer !== this.occupyingPlayer;
        });
    }

    isOccupied () {
        return this.occupyingPlayer ? true : false;
    }

    addUnits (numberOfUnits) {
        this.units += numberOfUnits;
    }

    occupy (player) {
        if (!this.occupyingPlayer) {
            this.occupyingPlayer = player;

            this.units = 1;
        } else {
            throw new Error('Already occupied');
        }
    }

    toString () {
        return JSON.stringify({
            name: this.name,
            occupyingPlayer: this.player,
            continent: this.continent.name
        });
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            owner: this.occupyingPlayer ? this.occupyingPlayer.id : null,
            units: this.units,
            continent: this.continent ? this.continent.toJSON() : null,
            adjacentTerritories: Array.from(this.adjacentTerritories.values()).map(territory => {
                return territory.id;
            })
        };
    }
}

module.exports = Territory;
