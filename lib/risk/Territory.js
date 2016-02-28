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

            player.territories.add(this);

            this.unts = 1;
        } else {
            throw new Error('Already occupied');
        }

        debug('territory occupied', player.toString());
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
