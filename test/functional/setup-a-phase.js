'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');

describe('setup_a phase', function () {
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

    const game = risk.Game(gameListener, options);

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});
    const playerOrder = [];

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

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
            playerEvents.REQUIRE_TERRITORY_CLAIM.push(data);

            if (playerOrder.length < options.players.length) {
                playerOrder.push(data.playerId);
            }

            game.act.claimTerritory(data.playerId, data.territoryIds[0]);
        });

        game.start();
    });

    it('REQUIRE_TERRITORY_CLAIM player events are emitted to correct players', function () {
        const numberOfTerritories = game.board.getTerritories().length;

        let playerCount = 0;

        for (let i = 0; i < playerEvents.REQUIRE_TERRITORY_CLAIM.length; i++) {
            const claim = playerEvents.REQUIRE_TERRITORY_CLAIM[i];

            if (i % playerOrder.length === 0) {
                playerCount = 0;
            } else {
                playerCount += 1;
            }

            const playerId = playerOrder[playerCount];

            expect(claim.playerId).to.equal(playerId)
        }

        // expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0]).to.have.property('territoryIds');
        // expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].territoryIds).to.be.an('array');
        // expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0]).to.have.property('message');
        // expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].message).to.match(/^You must claim a territory. Available/);
        // expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0]).to.have.property('playerId');
        // expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].playerId).to.equal(playerId);

        expect(playerEvents.REQUIRE_TERRITORY_CLAIM).to.have.length(numberOfTerritories);
    });
});
