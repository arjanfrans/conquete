'use strict';

const ERRORS = require('../../errors');
const createError = require('strict-errors').createError;

const events = require('../../events');
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

function FortifyPhase ({ emit }) {
    const movements = new Map();
    let player = null;

    function setPlayer (value) {
        player = value;
    }

    function moveUnits (fromTerritory, toTerritory, units) {
        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsError, { units });
        }

        if (fromTerritory.getOwner() !== player || toTerritory.getOwner() !== player) {
            throw createError(ERRORS.MoveOwnTerritoriesError, {
                territoryIds: [
                    fromTerritory.getOwner() !== player ? fromTerritory.getId() : null,
                    toTerritory.getOwner() !== player ? toTerritory.getId() : null
                ].filter(Boolean)
            });
        }

        if (!fromTerritory.isAdjacentTo(toTerritory)) {
            throw createError(ERRORS.TerritoriesAdjacentError, {
                territoryIds: [fromTerritory.getId(), toTerritory.getId()]
            });
        }

        if (fromTerritory.getUnits() - units <= 0) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        const move = {
            from: fromTerritory,
            to: toTerritory,
            units: units
        };

        movements.set(fromTerritory.getId(), move);

        emit(PLAYER_EVENTS.QUEUED_MOVE, player.getId(), {
            from: move.from.getId(),
            to: move.to.getId(),
            units: move.units
        });
    }

    function applyMovements () {
        emit(GAME_EVENTS.MOVE_UNITS, {
            playerId: player.getId(),
            movements: movements.map((move) => {
                move.from.removeUnits(move.units);
                move.to.addUnits(move.units);

                return {
                    from: move.from.getId(),
                    to: move.to.getId(),
                    units: move.units
                };
            })
        });

        movements.clear();
    }

    function nextPhase () {
        applyMovements();
    }

    return Object.freeze({
        setPlayer,
        moveUnits,
        nextPhase
    });
}

module.exports = { create: FortifyPhase };
