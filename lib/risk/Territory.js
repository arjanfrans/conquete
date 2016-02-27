'use strict';

class Territory {
    constructor (id, name) {
        this.id = id;
        this.name = name;
        this.occupyingPlayer = null;
        this.adjacentTerritories = new Map();
        this.continent = null;
    }

    addAdjacentTerritory (territory) {
        this.adjacentTerritories.set(territory.name, territory);
    }

    isOccupied () {
        return this.occupyingPlayer ? true : false;
    }

    occupy (player) {
        if (!this.occupyingPlayer) {
            this.occupyingPlayer = player;
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
}

module.exports = Territory;
