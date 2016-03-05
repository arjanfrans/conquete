'use strict';

function toSnakeCase(name) {
    return name.replace(/ /g, '_').toLowerCase();
}

function buildTerritories(data) {
    let contintents = [];
    let territories = new Map();

    Object.keys(data.nodes).forEach(nodeId => {
        let node = data.nodes[nodeId];
        let territoryId = toSnakeCase(node.name);
        let territory = {
            id: territoryId,
            name: node.name,
            continentId: null,
            adjacentTerritoryIds: []
        };

        territories.set(nodeId, territory);
    });

    data.edges.forEach(edge => {
        let territoryA = territories.get(edge[0]);
        let territoryB = territories.get(edge[1]);

        territoryA.adjacentTerritoryIds.push(territoryB.id);
        territoryB.adjacentTerritoryIds.push(territoryA.id);
    });

    return territories;
}

function buildContinentsAndTerritories (data) {
    let territories = buildTerritories(data);
    let continents = [];

    Object.keys(data.clusters).forEach(clusterId => {
        let cluster = data.clusters[clusterId];
        let continentId = toSnakeCase(cluster.name);
        let continent = {
            id: continentId,
            name: cluster.name,
            bonus: cluster.bonus,
            territoryIds: []
        };

        cluster.nodes.forEach(nodeId => {
            let node = cluster.nodes[nodeId];
            let territory = territories.get(nodeId);

            territory.continentId = continent.id;

            continent.territoryIds.push(territory.id);
        });

        continents.push(continent);
    });

    return {
        territories: Array.from(territories.values()),
        continents: continents
    };
}

module.exports = buildContinentsAndTerritories;
