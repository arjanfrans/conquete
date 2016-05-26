'use strict';

const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

function Territory ({ id, name, continent = null, units = 0 }) {
    let owner = null;
    const adjacentTerritories = new Set();

    function setContinent (value) {
        continent = value;
    }

    function getContinent () {
        return continent;
    }

    function getOwner () {
        return owner;
    }

    function getUnits () {
        return units;
    }

    function getId () {
        return id;
    }

    function getName () {
        return name;
    }

    function addAdjacentTerritory (territory) {
        adjacentTerritories.add(territory);
    }

    function isAdjacentTo (territory) {
        return adjacentTerritories.has(territory);
    }

    function getAdjacentTerritories () {
        return Array.from(adjacentTerritories.values());
    }

    function enemyAdjacentTerritories () {
        return getAdjacentTerritories().filter(territory => {
            return territory.getOwner() !== owner;
        });
    }

    function ownAdjacentTerritories () {
        return getAdjacentTerritories().filter(territory => {
            return territory.getOwner() === owner;
        });
    }

    function addUnits (numberOfUnits) {
        units += numberOfUnits;
    }

    function removeUnits (numberOfUnits) {
        if (numberOfUnits >= units) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        units -= numberOfUnits;
    }

    function setOwner (value) {
        owner = value;
    }

    function setUnits (value) {
        units = value;
    }

    function toJSON () {
        return {
            id,
            name,
            owner: owner ? owner.getId() : null,
            units,
            continentId: continent ? continent.getId() : null,
            adjacentTerritoryIds: getAdjacentTerritories().map(territory => {
                return territory.getId();
            })
        };
    }

    return Object.freeze({
        getUnits,
        getOwner,
        getAdjacentTerritories,
        ownAdjacentTerritories,
        enemyAdjacentTerritories,
        addAdjacentTerritory,
        isAdjacentTo,
        getContinent,
        getId,
        getName,
        setUnits,
        setOwner,
        setContinent,
        addUnits,
        removeUnits,
        toJSON
    });
}

module.exports = { create: require('./protect-object')(Territory) };
//
// class Territory {
//     constructor (id, name) {
//         this.id = id;
//         this.name = name;
//         this.owner = null;
//         this.adjacentTerritories = new Set();
//         this.continent = null;
//         this.units = 0;
//     }
//
//     getUnits () {
//         return this.units;
//     }
//
//     getOwner () {
//         return this.owner;
//     }
//
//     addAdjacentTerritory (territory) {
//         this.adjacentTerritories.add(territory);
//     }
//
//     isAdjacentTo (territory) {
//         return this.adjacentTerritories.has(territory);
//     }
//
//     ownAdjacentTerritories () {
//         const territories = Array.from(this.adjacentTerritories.values());
//
//         return territories.filter(territory => {
//             return territory.owner === this.owner;
//         });
//     }
//
//     enemyAdjacentTerritories () {
//         const territories = Array.from(this.adjacentTerritories.values());
//
//         return territories.filter(territory => {
//             return territory.owner !== this.owner;
//         });
//     }
//
//     addUnits (numberOfUnits) {
//         this.units += numberOfUnits;
//     }
//
//     removeUnits (numberOfUnits) {
//         if (numberOfUnits >= this.units) {
//             throw createError(ERRORS.LeaveOneUnitError);
//         }
//
//         this.units -= numberOfUnits;
//     }
//
//     getId () {
//         return this.id;
//     }
//
//     setOwner (player, units) {
//         if (this.owner) {
//             this.owner.removeTerritory(this);
//         }
//
//         player.addTerritory(this);
//         this.owner = player;
//         this.units = units;
//     }
//
//     toJSON () {
//         return {
//             id: this.id,
//             name: this.name,
//             owner: this.owner ? this.owner.getId() : null,
//             units: this.units,
//             continentId: this.continent ? this.continent.getId() : null,
//             adjacentTerritoryIds: Array.from(this.adjacentTerritories.values()).map(territory => {
//                 return territory.id;
//             })
//         };
//     }
// }
//
// module.exports = Territory;
