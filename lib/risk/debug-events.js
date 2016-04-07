'use strict';

const Debug = require('debug');

const GAME_EVENTS = require('./events/game-events');
const constants = require('./constants');
const PLAYER_EVENTS = constants.PLAYER_EVENTS;

function debugPlayerEvents (emitter, playerId) {
    const debug = Debug(`risk:debug:player-events-${playerId}`);

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

    emitter.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, () => {
        debug(`${playerId} - attack or continue to fortify`);
    });

    emitter.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, () => {
        debug(`${playerId} - move units or end your turn`);
    });

    return emitter;
}


function debugGameEvents (emitter) {
    const debug = Debug('risk:debug:game-events');

    for (let eventKey of Object.keys(GAME_EVENTS)) {
        const event = GAME_EVENTS[eventKey];

        emitter.on(event.name, data => {
            if (data.message) {
                if (typeof data.message === 'function') {
                    debug(data.message(data));
                } else {
                    debug(data.message);
                }
            } else {
                debug('no message: ', data);
            }
        });
    }

    return emitter;
}

module.exports = { debugGameEvents, debugPlayerEvents };
