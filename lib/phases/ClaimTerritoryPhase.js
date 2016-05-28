'use strict';

const ERRORS = require('../errors');
const createError = require('strict-errors').createError;

const events = require('../events');
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

function ClaimTerritoryPhase ({ board, emit }) {
    const nextPhase = 'setup_b';
    let player = null;

    function setPlayer (value) {
        player = value;
    }

    function claimTerritory (territory) {
        if (territory.getOwner()) {
            throw createError(ERRORS.TerritoryClaimedError, {
                territoryId: territory.getId(),
                owner: territory.getOwner().getId()
            });
        }

        player.removeStartUnit();
        territory.setOwner(player);
        territory.setUnits(1);
        player.addTerritory(territory);

        emit(GAME_EVENTS.TERRITORY_CLAIMED, {
            playerId: player.getId(),
            territoryId: territory.getId(),
            units: 1
        });
    }

    function end (nextPlayer) {
        let afterTurnEvent = null;

        if (board.areAllTerritoriesOccupied()) {
            emit(GAME_EVENTS.PHASE_CHANGE, {
                playerId: nextPlayer.getId(),
                phase: nextPhase
            });
        } else {
            afterTurnEvent = () => {
                emit(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, nextPlayer.getId(), {
                    territoryIds: board.getAvailableTerritories().map(territory => {
                        return territory.getId();
                    })
                });
            };
        }

        emit(GAME_EVENTS.TURN_CHANGE, {
            playerId: nextPlayer.getId()
        });

        if (afterTurnEvent) {
            afterTurnEvent();
        }
    }

    return Object.freeze({
        setPlayer,
        claimTerritory,
        end
    });
}

module.exports = { create: ClaimTerritoryPhase };
