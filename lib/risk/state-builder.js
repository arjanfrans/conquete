'use strict';

const RotatingQueue = require('./utils/RotatingQueue');
const constants = require('./constants');
const State = require('./State');
const TURN_PHASES = constants.TURN_PHASES;
const PHASES = constants.PHASES;
const CARD_TYPES = constants.CARD_TYPES;
const JOKER_CARD = constants.JOKER_CARD;

function buildCards (territories, jokerCards) {
    const territoryIds = territories.map(territory => territory.id);
    const cards = [];

    for (let i = 0; i < jokerCards; i++) {
        cards.push(JOKER_CARD + '_' + i);
    }

    const cardTypes = new RotatingQueue(Object.keys(CARD_TYPES).map(type => CARD_TYPES[type]));

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
            players: options.players,
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

        const state = new State(rawState);

        state.playerQueue.shuffle();
        state.cardQueue.shuffle();

        state.turn.player = state.playerQueue.next();

        for (const player of state.players.values()) {
            player.startUnits = options.startUnits[state.players.size];
        }

        return state;
    } else {
        const state = new State(rawState);

        return state;
    }
}

module.exports = buildState;
