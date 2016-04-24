'use strict';

const errors = require('./errors');

const ERRORS = errors.ERRORS;
const createError = errors.createError;

class Territory {
    constructor (id, name) {
        this.id = id;
        this.name = name;
        this.owner = null;
        this.adjacentTerritories = new Set();
        this.continent = null;
        this.units = 0;
    }

    addAdjacentTerritory (territory) {
        this.adjacentTerritories.add(territory);
    }

    isAdjacentTo (territory) {
        return this.adjacentTerritories.has(territory);
    }

    ownAdjacentTerritories () {
        const territories = Array.from(this.adjacentTerritories.values());

        return territories.filter(territory => {
            return territory.owner === this.owner;
        });
    }

    enemyAdjacentTerritories () {
        const territories = Array.from(this.adjacentTerritories.values());

        return territories.filter(territory => {
            return territory.owner !== this.owner;
        });
    }

    addUnits (numberOfUnits) {
        this.units += numberOfUnits;
    }

    removeUnits (numberOfUnits) {
        if (numberOfUnits >= this.units) {
            throw createError(ERRORS.LeaveOneUnitError);
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
