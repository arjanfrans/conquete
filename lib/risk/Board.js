'use strict';

const debug = require('debug')('risk:Board');
const maps = require('./maps');
const Continent = require('./Continent');
const Territory = require('./Territory');

function toSnakeCase(name) {
    return name.replace(/ /g, '_').toLowerCase();
}

function buildTerritories(data) {
    let contintents = [];

    let territories = new Map();

    Object.keys(data.nodes).forEach(nodeId => {
        let node = data.nodes[nodeId];
        let territoryId = toSnakeCase(node.name);
        let territory = new Territory(territoryId, node.name);

        territories.set(nodeId, territory);
    });

    data.edges.forEach(edge => {
        let territoryA = territories.get(edge[0]);
        let territoryB = territories.get(edge[1]);

        territoryA.addAdjacentTerritory(territoryB);
        territoryB.addAdjacentTerritory(territoryA);
    });

    return territories;
}

function buildContinentsAndTerritories (data) {
    let territories = buildTerritories(data);
    let continents = new Map();

    Object.keys(data.clusters).forEach(clusterId => {
        let cluster = data.clusters[clusterId];
        let continentId = toSnakeCase(cluster.name);
        let continent = new Continent(continentId, cluster.name, cluster.bonus);

        cluster.nodes.forEach(nodeId => {
            let node = cluster.nodes[nodeId];

            let territory = territories.get(nodeId);

            territory.continent = continent;

            continent.addTerritory(territory);

        });

        continents.set(continent.id, continent);
    });

    let mappedTerritories = new Map();

    for (let territory of territories.values()) {
        mappedTerritories.set(territory.id, territory);
    }

    debug('territories created', mappedTerritories.keys());
    debug('continents created', continents.keys());

    return {
        territories: mappedTerritories,
        continents: continents
    };
}

class Board {
    constructor (mode) {
        this.mode = mode;
        let data = maps[mode]();

        let continentsAndTerritories = buildContinentsAndTerritories(data);

        this.territories = continentsAndTerritories.territories;
        this.continents = continentsAndTerritories.continents;
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

        if (!content) {
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
