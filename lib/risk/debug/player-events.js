'use strict';

const constants = require('../constants');
const debug = require('debug')('risk:debug/player-events');
const PLAYER_EVENTS = constants.PLAYER_EVENTS;

function debugPlayerEvents (emitter, playerId) {
    emitter.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
        debug(`${playerId} - ${data.type} dice roll required, ${data.maxDice} dice available`);
    });

    emitter.on(PLAYER_EVENTS.NEW_CARD, data => {
        debug(`${playerId} - new card received: ${data.card}`);
    });

    emitter.on(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
        debug(`${playerId} - claim a territory: ${data.availableTerritoryIds.join(', ')}`);
    });

    emitter.on(PLAYER_EVENTS.QUEUED_MOVE, data => {
        debug(`${playerId} - ${data.units} units queued to move from ${data.from} to ${data.to}`);
    });

    emitter.on(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
        debug(`${playerId} - deploy 1 unit to one of your territitories (${data.availableUnits} units remaining)`);
    });

    emitter.on(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
        debug(`${playerId} - redeem cards and deploy units (${data.availableUnits} units available)`);
    });

    emitter.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
        debug(`${playerId} - attack or continue to fortify`);
    });

    emitter.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
        debug(`${playerId} - move units or end your turn`);
    });

    return emitter;
}

module.exports = debugPlayerEvents;
