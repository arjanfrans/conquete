'use strict';

const RotatingQueue = require('./utils/RotatingQueue');
const constants = require('./constants');
const stateParser = require('./utils/state-parser');
const TURN_PHASES = constants.TURN_PHASES;
const PHASES = constants.PHASES;

function buildCards (rawTerritories, cardTypes, jokerCard, jokerCards) {
    const territoryIds = rawTerritories.map(territory => territory.id);
    const cards = [];

    for (let i = 0; i < jokerCards; i++) {
        cards.push(jokerCard + '_' + i);
    }

    const typesQueue = RotatingQueue.create({
        items: cardTypes
    });

    for (const territoryId of territoryIds) {
        const type = typesQueue.next();
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
            cardManager: {
                cards: buildCards(rawBoard.territories, options.cardTypes, options.jokerCard, options.jokerCards || 2),
                bonusOptions: options.cardBonus,
                cardTypes: options.cardTypes,
                jokerCard: options.jokerCard
            },
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

        const state = stateParser.parse(rawState);

        state.getPlayerQueue().shuffle();
        state.getCardManager().shuffleCards();

        state.getTurn().player = state.getPlayerQueue().next();

        return state;
    } else {
        const state = stateParser.parse(rawState);

        return state;
    }
}

module.exports = buildState;
