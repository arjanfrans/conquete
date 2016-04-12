'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');
const stateSetupB = require('../states/setup-b');

describe('setup_b phase', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();
    const options = {
        players: [
            {
                id: '1',
                listener: playerListener
            },
            {
                id: '2',
                listener: playerListener
            }, {
                id: '3',
                listener: playerListener
            }
        ]
    };

    const game = risk.Game(gameListener, options, stateSetupB);

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    before(function () {
        gameListener.on(risk.GAME_EVENTS.GAME_START, data => {
            gameEvents.GAME_START.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_CHANGE, data => {
            gameEvents.TURN_CHANGE.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.PHASE_CHANGE, data => {
            gameEvents.PHASE_CHANGE.push(data);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
            playerEvents.REQUIRE_ONE_UNIT_DEPLOY.push(data);

            game.act.deployOneUnit(data.playerId, data.territoryIds[0]);
        });

        game.start();
    });

    it('GAME_START and previous emitted game event is emitted', function () {
        expect(gameEvents.GAME_START).to.have.length(1);
        expect(gameEvents.GAME_START[0]).to.have.property('message');
        expect(gameEvents.TURN_CHANGE).to.have.length(64);
        expect(gameEvents.TURN_CHANGE[0]).to.have.property('playerId',
            stateSetupB.previousTurnEvent.data.playerId);
    });

    it('PHASE_CHANGE is emitted when phase is changed to "attack"', function () {
        expect(gameEvents.PHASE_CHANGE).to.have.length(2);
        expect(gameEvents.PHASE_CHANGE[0]).have.property('phase', 'setup_b');
        expect(gameEvents.PHASE_CHANGE[1]).have.property('phase', 'battle');

        // playerId should equal the player that initially started the setup_b phase
        expect(gameEvents.PHASE_CHANGE[1]).to.have.property('playerId',
                stateSetupB.previousTurnEvent.data.playerId);

        const statePlayers = game.state.players;

        for (const player of statePlayers) {
            expect(player).to.have.property('startUnits', 0);
        }
    });
});
