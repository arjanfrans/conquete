'use strict';

const Debug = require('debug');

const GAME_EVENTS = require('./events/game-events');
const PLAYER_EVENTS = require('./events/player-events');

function debugPlayerEvents (emitter, playerId) {
    const debug = Debug(`risk:debug:player-events-${playerId}`);

    for (const eventKey of Object.keys(PLAYER_EVENTS)) {
        const event = PLAYER_EVENTS[eventKey];

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


function debugGameEvents (emitter) {
    const debug = Debug('risk:debug:game-events');

    for (const eventKey of Object.keys(GAME_EVENTS)) {
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
