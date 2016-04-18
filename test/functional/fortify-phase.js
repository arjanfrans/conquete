'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');
const stateFortify = require('../states/fortify');

describe('battle phase', function () {
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

    const game = risk.Game(gameListener, options, stateFortify);

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

        gameListener.on(risk.GAME_EVENTS.TURN_PHASE_CHANGE, data => {
            gameEvents.TURN_PHASE_CHANGE.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.MOVE_UNITS, data => {
            gameEvents.MOVE_UNITS.push(data);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
            playerEvents.REQUIRE_FORTIFY_ACTION.push(data);

            const player = game.getPlayer(data.playerId);

            for (const territoryId of player.territoryIds) {
                const fromTerritory = game.board.getTerritory(territoryId);
                const adjacent = game.board.getAdjacentTerritories(territoryId, true);

                if (adjacent.length > 0) {
                    const toTerritory = adjacent[0];

                    if (fromTerritory.units > 1) {
                        game.act.moveUnits(data.playerId, fromTerritory.id, toTerritory.id, fromTerritory.units - 1);
                    }
                }
            }

            game.act.endTurn(data.playerId);
        });

        playerListener.on(risk.PLAYER_EVENTS.QUEUED_MOVE, data => {
            playerEvents.QUEUED_MOVE.push(data);
        });

        game.start();
    });

    it('GAME_START and TURN_CHANGE emitted game event is emitted', function () {
        expect(gameEvents.GAME_START).to.have.length(1);
        expect(gameEvents.GAME_START[0]).to.have.property('message');
        expect(gameEvents.TURN_CHANGE).to.have.length(2);
        expect(gameEvents.TURN_CHANGE[0].playerId).to.equal(stateFortify.previousTurnEvent.data.playerId);

        expect(gameEvents.TURN_CHANGE[1].playerId).to.not.equal(stateFortify.previousTurnEvent.data.playerId);
    });

    it('REQUIRE_FORTIFY_ACTION and TURN_PHASE_CHANGE is emitted on foritfy', function () {
        expect(gameEvents.TURN_PHASE_CHANGE).to.have.length(1);
        expect(gameEvents.TURN_PHASE_CHANGE[0].playerId).to.equal(stateFortify.previousTurnEvent.data.playerId);
        expect(gameEvents.TURN_PHASE_CHANGE[0].phase).to.equal('fortifying');
        expect(gameEvents.TURN_PHASE_CHANGE[0].message).to.match(/^The turn phase has changed to "fortifying"/);

        expect(playerEvents.REQUIRE_FORTIFY_ACTION).to.have.length(1);
        expect(playerEvents.REQUIRE_FORTIFY_ACTION[0].playerId).to.equal(stateFortify.previousTurnEvent.data.playerId);
        expect(playerEvents.REQUIRE_FORTIFY_ACTION[0].message).to.match(/^You are in the foritfy/);
    });

    it('QUEUED_MOVE is emitted', function () {
        // expect(playerEvents.QUEUED_MOVE).to.have.length(1);
        // expect(playerEvents.QUEUED_MOVE[0].movements).to.be.an('array');
        // // console.log(playerEvents.QUEUED_MOVE[0]);
        // expect(playerEvents.QUEUED_MOVE[0].movements).to.deep.equal([
        //
        // ]);
        // console.log(playerEvents.QUEUED_MOVE)
        // console.log(gameEvents.MOVE_UNITS)
    });
});
