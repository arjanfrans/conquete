'use strict';

const RotatingQueue = require('./RotatingQueue');
const constants = require('constants');
const CARD_TYPES = constants.CARD_TYPES;
const JOKER_CARD = constants.JOKER_CARD;

function buildCards (territories, jokerCards) {
    let territoryIds = territores.map(territory => territory.id);
    let cards = [];

    for (let i = 0; i < jokerCards; i++) {
        cards.push(JOKER_CARD + '_' + i);
    }

    let cardTypes = new RotatingQueue(CARD_TYPES);

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
            cards: buildCards(board.territories, options.jokerCards || 2)
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
