'use strict';

const ERRORS = require('../errors');
const createError = require('strict-errors').createError;

const events = require('../events');
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

const TURN_PHASES = {
    PLACEMENT: 'placement',
    ATTACKING: 'attacking',
    FORTIFYING: 'fortifying'
};

const PlacementPhase = require('./turn/PlacementPhase');
const AttackPhase = require('./turn/AttackPhase');
const FortifyPhase = require('./turn/FortifyPhase');

function BattlePhase ({ emit, board, cardManager, players }) {
    let player = null;
    let turn = null;
    const turnPhases = new Map([
        ['placement', PlacementPhase.create({ emit, board, cardManager })],
        ['attacking', AttackPhase.create({ emit, board, players, cardManager })],
        ['fortifying', FortifyPhase.create({ emit })]
    ]);
    let turnPhase = 'placement';

    function nextTurnPhase () {

    }

    function setPlayer (value) {
        player = value;
    }

    function end (nextPlayer) {
        applyMovements();

        resetTurnPhase();

        emit(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, nextPlayer.getId(), {
            units: availableUnits(),
            territoryIds: nextPlayer.getTerritories().map(territory => territory.getId()),
            cards: nextPlayer.getCards()
        });
    }

    resetTurnPhase();

    return Object.freeze({
        setPlayer,
        end
    });
}

module.exports = { create: BattlePhase };
