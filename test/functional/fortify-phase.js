'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../');
const stateFortify = require('../states/fortify');

describe('battle phase', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();

    const options = {
        listener: gameListener,
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

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const queuedMoves = [];
    const playerChanges = [];

    before(function () {
        const game = risk.Game(options, stateFortify);

        gameListener.on(risk.GAME_EVENTS.GAME_START, data => {
            gameEvents.GAME_START.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_CHANGE, data => {
            playerChanges.push(game.currentPlayer);
            gameEvents.TURN_CHANGE.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_PHASE_CHANGE, data => {
            gameEvents.TURN_PHASE_CHANGE.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.MOVE_UNITS, data => {
            gameEvents.MOVE_UNITS.push(data);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
            playerEvents.REQUIRE_PLACEMENT_ACTION.push(data);
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
                        queuedMoves.push({ from: fromTerritory, to: toTerritory, units: fromTerritory.units - 1 });
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

    it('current player is correct', function () {
        expect(playerChanges).to.have.length(2);
        expect(playerChanges[0].id).to.equal(stateFortify.previousTurnEvent.data.playerId);
        expect(playerChanges[1].id).to.not.equal(stateFortify.previousTurnEvent.data.playerId);
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

    it('QUEUED_MOVE and MOVE_UNITS are emitted', function () {
        expect(playerEvents.QUEUED_MOVE).to.have.length(1);
        expect(playerEvents.QUEUED_MOVE[0].playerId).to.equal(queuedMoves[0].from.owner);
        expect(playerEvents.QUEUED_MOVE[0].from).to.equal(queuedMoves[0].from.id);
        expect(playerEvents.QUEUED_MOVE[0].to).to.equal(queuedMoves[0].to.id);
        expect(playerEvents.QUEUED_MOVE[0].units).to.equal(queuedMoves[0].units);
        expect(playerEvents.QUEUED_MOVE[0].message).to.match(/^You queued a move with 24/);

        expect(gameEvents.MOVE_UNITS).to.have.length(1);
        expect(gameEvents.MOVE_UNITS[0].message).to.match(/^Player "3" moved units: 24/);
        expect(gameEvents.MOVE_UNITS[0].playerId).to.equal(queuedMoves[0].to.owner);
        expect(gameEvents.MOVE_UNITS[0].movements).to.deep.equal([
            {
                from: queuedMoves[0].from.id,
                to: queuedMoves[0].to.id,
                units: queuedMoves[0].units
            }
        ]);
    });

    it('END_TURN and REQUIRE_PLACEMENT_ACTION are emitted', function () {
        expect(gameEvents.TURN_CHANGE[1].playerId).to.not.equal(stateFortify.previousTurnEvent.data.playerId);
        expect(playerEvents.REQUIRE_PLACEMENT_ACTION).to.have.length(1);
        expect(playerEvents.REQUIRE_PLACEMENT_ACTION[0].playerId).to.not.equal(stateFortify.previousTurnEvent.data.playerId);
        expect(playerEvents.REQUIRE_PLACEMENT_ACTION[0].playerId).to.equal(gameEvents.TURN_CHANGE[1].playerId);
    });
});
