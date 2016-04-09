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

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
            playerEvents.REQUIRE_ONE_UNIT_DEPLOY.push(data);
        });

        game.start();
    });

    it('REQUIRE_TERRITORY_CLAIM is emitted and turn is changed correctly', function () {
        const numberOfTerritories = game.board.getTerritories().length;

        let playerCount = 0;
        let availableTerritoryCount = numberOfTerritories;

        for (let i = 0; i < playerEvents.REQUIRE_TERRITORY_CLAIM.length; i++) {
            const claim = playerEvents.REQUIRE_TERRITORY_CLAIM[i];
            const turn = gameEvents.TURN_CHANGE[i];

            if (i % playerOrder.length === 0) {
                playerCount = 0;
            } else {
                playerCount += 1;
            }

            const playerId = playerOrder[playerCount];

            expect(claim.playerId).to.equal(playerId);
            expect(turn.playerId).to.equal(playerId);

            expect(claim.territoryIds).to.have.length(availableTerritoryCount)
            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].message).to.match(/^You must claim a territory. Available/);
            availableTerritoryCount -= 1;
        }

        expect(playerEvents.REQUIRE_TERRITORY_CLAIM).to.have.length(numberOfTerritories);
    });

    it('PHASE_CHANGE is emitted after all territories are claimed', function () {
        expect(gameEvents.PHASE_CHANGE).to.have.length(2);
        expect(gameEvents.PHASE_CHANGE[0]).to.have.property('phase', 'setup_a');
        expect(gameEvents.PHASE_CHANGE[0]).to.have.property('playerId', playerOrder[0]);
        expect(gameEvents.PHASE_CHANGE[1]).to.have.property('phase', 'setup_b');
        expect(gameEvents.PHASE_CHANGE[1]).to.have.property('playerId', playerOrder[0]);
    });

    it('REQUIRE_ONE_UNIT_DEPLOY is deploy when phase is changed to "setup_b"', function () {
        expect(playerEvents.REQUIRE_ONE_UNIT_DEPLOY).to.have.length(1)
        expect(playerEvents.REQUIRE_ONE_UNIT_DEPLOY[0]).to.have.property('playerId', playerOrder[0]);
        expect(playerEvents.REQUIRE_ONE_UNIT_DEPLOY[0]).to.have.property('message', 'You must place 1 unit on one of your territories.');
        expect(playerEvents.REQUIRE_ONE_UNIT_DEPLOY[0]).to.have.property('remainingUnits', 21);
    });
});
