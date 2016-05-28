'use strict';

const ERRORS = require('../errors');
const createError = require('strict-errors').createError;

const events = require('../events');
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

function InitialUnitPhase ({ emit }) {
    const nextPhase = 'battle';
    let player = null;

    function setPlayer (value) {
        player = value;
    }

    function deployOneUnit (territory) {
        if (territory.getOwner() !== player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: territory.getId(),
                owner: territory.getOwner().getId()
            });
        }

        if (!player.hasStartUnits()) {
            throw createError(ERRORS.NoStartingUnitsError);
        }

        player.removeStartUnit();

        territory.addUnits(1);

        emit(GAME_EVENTS.DEPLOY_UNITS, {
            playerId: player.getId(),
            territoryId: territory.getId(),
            units: 1
        });
    }

    function end (nextPlayer) {
        emit(GAME_EVENTS.PHASE_CHANGE, {
            playerId: nextPlayer.getId(),
            phase: nextPhase
        });

        emit(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, nextPlayer.getId(), {
            remainingUnits: nextPlayer.getStartUnits(),
            territoryIds: nextPlayer.getTerritories().map(territory => territory.getId())
        });

        emit(GAME_EVENTS.TURN_CHANGE, {
            playerId: nextPlayer.getId()
        });
    }

    return Object.freeze({
        setPlayer,
        deployOneUnit,
        end
    });
}

module.exports = { create: InitialUnitPhase };
