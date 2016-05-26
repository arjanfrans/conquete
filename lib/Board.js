'use strict';

const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

function Board ({ territories, continents }) {
    function getTerritoryById (id) {
        const territory = territories.get(id);

        if (territory) {
            return territory;
        }

        throw createError(ERRORS.InvalidTerritoryError, { territoryId: id });
    }

    function getContinents () {
        return Array.from(continents.values());
    }

    function getTerritories () {
        return Array.from(territories.values());
    }

    function getContinentById (id) {
        const continent = continents.get(id);

        if (continent) {
            return continent;
        }

        throw createError(ERRORS.InvalidContinentError, { continentId: id });
    }

    function getAvailableTerritories () {
        return Array.from(territories.values()).filter(territory => {
            return !territory.getOwner();
        });
    }

    function getPlayerTerritories (player) {
        return Array.from(territories.values()).filter(territory => {
            return territory.getOwner() === player;
        });
    }

    function getPlayerContinents (player) {
        return Array.from(continents.values()).filter(continent => {
            return continent.getOwner() === player;
        });
    }

    function areAllTerritoriesOccupied () {
        return Array.from(territories.values()).every(territory => {
            return territory.getOwner();
        });
    }

    function toJSON () {
        return {
            territories: Array.from(territories.values()).map(territory => {
                return territory.toJSON();
            }),
            continents: Array.from(continents.values()).map(continent => {
                return continent.toJSON();
            })
        };
    }

    return Object.freeze({
        getContinents,
        getTerritories,
        getContinentById,
        getTerritoryById,
        getPlayerTerritories,
        getAvailableTerritories,
        getPlayerContinents,
        areAllTerritoriesOccupied,
        toJSON
    });
}

module.exports = { create: require('./protect-object')(Board) };
