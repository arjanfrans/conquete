'use strict';

const ERRORS = require('./errors');
const createError = require('strict-errors').createError;
const protect = require('object-protect');

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

module.exports = { create: protect(Territory) };
