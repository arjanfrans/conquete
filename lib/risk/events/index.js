'use strict';

const GAME_EVENTS = require('./game-events');
const PLAYER_EVENTS = require('./player-events');

function createEvent (event, data) {
    if (event.required) {
        for (const key of event.required) {
            if (!data.hasOwnProperty(key)) {
                throw new Error(`Event "${event.name}" is missing required data property "${key}".`);
            }
        }
    }

    let message = data.message || null;

    if (!message && event.message) {
        if (typeof event.message === 'function') {
            message = event.message(data);
        } else {
            message = event.message;
        }
    }

    return {
        name: event.name,
        data: Object.assign({}, data, { message })
    };
}

module.exports = { GAME_EVENTS, PLAYER_EVENTS, createEvent };
