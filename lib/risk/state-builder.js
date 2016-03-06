'use strict';

const RotatingQueue = require('./RotatingQueue');
const constants = require('./contstants');
const State = require('./State');
const CARD_TYPES = constants.CARD_TYPES;
const JOKER_CARD = constants.JOKER_CARD;

function buildCards (territories, jokerCards) {
    let territoryIds = territories.map(territory => territory.id);
    let cards = [];

    for (let i = 0; i < jokerCards; i++) {
        cards.push(JOKER_CARD + '_' + i);
    }

    let cardTypes = new RotatingQueue(Object.keys(CARD_TYPES).map(type => CARD_TYPES[type]));

    for (let territoryId of territoryIds) {
        let type = cardTypes.next();
        let id = type + '_' + territoryId;

        cards.push(id);
    }

    return cards;
}

function buildState (options, rawState) {
    if (!rawState) {
        let rawBoard = require('../../maps/' + options.map);

        rawState = {
            board: rawBoard,
            cards: buildCards(rawBoard.territories, options.jokerCards || 2),
            players: options.players
        };

        let state = new State(rawState);

        for (let player of state.players.values()) {
            player.startUnits = options.startUnits[state.players.size];
        }

        return state;
    } else {
        return new State(rawState);
    }
}

module.exports = buildState;
