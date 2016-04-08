'use strict';

class Board {
    constructor (territories, continents) {
        this.territories = territories;
        this.continents = continents;
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
