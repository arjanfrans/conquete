'use strict';

const GAME_EVENTS = require('./game-events');
const PLAYER_EVENTS = require('./player-events');

const createEventDefinitions = require('strict-emitter').createEventDefinitions;

module.exports = {
    GAME_EVENTS: createEventDefinitions(GAME_EVENTS),
    PLAYER_EVENTS: createEventDefinitions(PLAYER_EVENTS)
};
