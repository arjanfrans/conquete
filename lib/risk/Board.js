'use strict';

const debug = require('debug')('risk:Board');

class Board {
    constructor (territories, continents) {
        this.territories = territories;
        this.continents = continents;
    }

    getTerritoryById (territoryId) {
        let territory =  this.territories.get(territoryId);

        if (!territory) {
            throw new Error('Territory does not exist');
        }

        return territory;
    }

    getContinentById (continentId) {
        let continent = this.continents.get(continentId);

        if (!continent) {
            throw new Error('Content does not exist');
        }

        return continent;
    }

    getPlayerTerritories (player) {
        return Array.from(this.territories.values()).filter(territory => {
            return territory.occupyingPlayer === player;
        });
    }

    getPlayerContinents (player) {
        return Array.from(this.continents.values()).filter(continent => {
            return continent.occupyingPlayer === player;
        });
    }

    areAllTerritoriesOccupied () {
        return Array.from(this.territories.values()).every(territory => {
            return territory.isOccupied();
        });
    }

    getUnoccupiedTerritories () {
        return Array.from(this.territories.values()).filter(territory => {
            return !territory.isOccupied();
        });
    }

    totalTerritories () {
        return this.territories.size;
    }

    totalContinents () {
        return this.continents.size;
    }

    toJSON () {
        return JSON.stringify({
            territories: Array.from(this.territories.values()),
            continents: Array.from(this.continents.values())
        });
    }
}

module.exports = Board;
