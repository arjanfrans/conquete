'use strict';

const errors = require('./errors');
const ERRORS = errors.ERRORS;
const createError = errors.createError;

class Board {
    constructor (territories, continents) {
        this.territories = territories;
        this.continents = continents;
    }

    getTerritoryById (id) {
        const territory = this.territories.get(id);

        if (territory) {
            return territory;
        }

        throw createError(ERRORS.InvalidTerritoryError, { territoryId: id });
    }

    getContinentById (id) {
        const continent = this.continents.get(id);

        if (continent) {
            return continent;
        }

        throw createError(ERRORS.InvalidContinentError, { continentId: id });
    }

    getAvailableTerritories () {
        return Array.from(this.territories.values()).filter(territory => {
            return !territory.owner;
        });
    }

    getPlayerTerritories (player) {
        return Array.from(this.territories.values()).filter(territory => {
            return territory.owner === player;
        });
    }

    getPlayerContinents (player) {
        return Array.from(this.continents.values()).filter(continent => {
            return continent.owner === player;
        });
    }

    areAllTerritoriesOccupied () {
        return Array.from(this.territories.values()).every(territory => {
            return territory.owner;
        });
    }

    toJSON () {
        return {
            territories: Array.from(this.territories.values()).map(territory => {
                return territory.toJSON();
            }),
            continents: Array.from(this.continents.values()).map(continent => {
                return continent.toJSON();
            })
        };
    }
}

module.exports = Board;
