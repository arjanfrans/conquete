'use strict';

const debug = require('debug')('risk:Territory');

class Territory {
    constructor (id, name) {
        this.id = id;
        this.name = name;
        this.owner = null;
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
            return territory.owner === this.owner;
        });
    }

    enemyAdjacentTerritories () {
        let territories = Array.from(this.adjacentTerritories.values());

        return territories.filter(territory => {
            return territory.owner !== this.owner;
        });
    }

    addUnits (numberOfUnits) {
        this.units += numberOfUnits;
    }

    removeUnits (numberOfUnits) {
        if (numberOfUnits >= this.units) {
            throw new Error('Keep at least 1 unit');
        }

        this.units -= numberOfUnits;
    }

    setOwner (player, units) {
        if (this.owner) {
            this.owner.territories.delete(this);
        }

        player.territories.add(this);
        this.owner = player;
        this.units = units;
    }

    occupy (player) {
        if (!this.owner) {
            this.owner = player;

            this.units = 1;
        } else {
            throw new Error('Already occupied');
        }
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            owner: this.owner ? this.owner.id : null,
            units: this.units,
            continentId: this.continent ? this.continent.id : null,
            adjacentTerritoryIds: Array.from(this.adjacentTerritories.values()).map(territory => {
                return territory.id;
            })
        };
    }
}

module.exports = Territory;
