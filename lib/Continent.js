'use strict';

function Continent ({ id, name, bonus }) {
    const territories = new Set();

    function getId () {
        return id;
    }

    function getName () {
        return name;
    }

    function getBonus () {
        return bonus;
    }

    function addTerritory (territory) {
        territories.add(territory);
    }

    function getAdjacentContinents () {
        const continents = [];

        for (const territory of territories) {
            const adjacentTerritories = territory.adjacentTerritories;

            for (const adjacentTerritory of adjacentTerritories.values()) {
                if (adjacentTerritory.continent !== null && adjacentTerritory.continent.getId() !== id) {
                    if (!continents.includes(adjacentTerritory.continent)) {
                        continents.push(adjacentTerritory.continent);
                    }
                }
            }
        }

        return continents;
    }

    function getOwner () {
        let owner = null;
        const continentTerritories = Array.from(territories);

        for (let i = 0; i < continentTerritories.length - 1; i++) {
            const territory = continentTerritories[i];

            if (territory.owner) {
                if (territory.owner === continentTerritories[i + 1].owner) {
                    owner = territory.owner;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        return owner;
    }

    function toJSON () {
        return {
            id: id,
            name: name,
            owner: getOwner() ? getOwner().getId() : null,
            bonus: bonus,
            territoryIds: Array.from(territories.values()).map(territory => {
                return territory.id;
            }),
            adjacentContinentIds: getAdjacentContinents().map(continent => {
                return continent.getId();
            })
        };
    }

    return Object.freeze({
        addTerritory,
        getId,
        getName,
        getBonus,
        getAdjacentContinents,
        getOwner,
        toJSON
    });
}

module.exports = { create: Continent };
