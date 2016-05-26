'use strict';

const RotatingQueue = require('./utils/RotatingQueue');
const constants = require('./constants');
const stateLoader = require('./utils/state-loader');
const TURN_PHASES = constants.TURN_PHASES;
const PHASES = constants.PHASES;
const CARD_TYPES = constants.CARD_TYPES;
const JOKER_CARD = constants.JOKER_CARD;

function buildCards (rawTerritories, jokerCards) {
    const territoryIds = rawTerritories.map(territory => territory.id);
    const cards = [];

    for (let i = 0; i < jokerCards; i++) {
        cards.push(JOKER_CARD + '_' + i);
    }

    const cardTypes = RotatingQueue.create({
        items: Object.keys(CARD_TYPES).map(type => CARD_TYPES[type])
    });

    for (const territoryId of territoryIds) {
        const type = cardTypes.next();
        const id = type + '_' + territoryId;

        cards.push(id);
    }

    return cards;
}

function buildState (options, rawState) {
    if (!rawState) {
        const rawBoard = options.map;

        rawState = {
            board: rawBoard,
            cards: buildCards(rawBoard.territories, options.jokerCards || 2),
            players: options.players.map(player => {
                return Object.assign({ startUnits: options.startUnits[options.players.length] }, player);
            }),
            phase: PHASES.SETUP_A,
            turn: {
                movements: [],
                phase: TURN_PHASES.PLACEMENT,
                battle: null,
                unitsPlaced: 0,
                cardBonus: 0,
                wonBattle: false
            }
        };

        const state = stateLoader.load(rawState);

        state.getPlayerQueue().shuffle();
        state.getCardQueue().shuffle();

        state.getTurn().player = state.getPlayerQueue().next();

        return state;
    } else {
        const state = stateLoader.load(rawState);

        return state;
    }
}

module.exports = buildState;
