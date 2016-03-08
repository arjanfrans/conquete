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

    totalTerritories () {
        return this.territories.size;
    }

    totalContinents () {
        return this.continents.size;
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
