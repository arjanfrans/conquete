'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../');

describe('start game', function () {
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

    const game = risk.Game(options);

    it('has correct property values', function () {
        expect(game.options).to.be.an('object');
        expect(game.options).to.have.all.keys([
            'players',
            'map',
            'cardBonus',
            'debug',
            'jokerCards',
            'startUnits',
            'listener'
        ]);

        expect(game.phase).to.equal('setup_a');
        expect(game.turnPhase).to.equal('placement');
        expect(game.isGameOver()).to.equal(false);
        expect(game.players.length).to.equal(3);
        expect(game.getAvailableUnits('1')).to.equal(35);
        expect(game.battle).to.equal(null);
        expect(game.getPlayer('2')).to.deep.equal({
            id: '2',
            dead: false,
            territoryIds: [],
            cardsCount: 0
        });

        for (const actionName of Object.keys(game.act)) {
            const action = game.act[actionName];

            expect(() => action()).to.throw('Game has not started.');
        }
    });

    context('start game', function () {
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

            playerListener.on(risk.PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
                playerEvents.REQUIRE_TERRITORY_CLAIM.push(data);
            });

            game.start();
        });

        it('throws errors when forbidden methods are called', function () {
            const forbiddenActions = Object.keys(risk.PHASE_METHODS).reduce((prev, phase) => {
                return phase !== 'setup_a' ? prev.concat(risk.PHASE_METHODS[phase]) : prev;
            }, []);

            for (const actionName of forbiddenActions) {
                expect(() => game.act[actionName]()).to.throw('Action is not allowed in game phase "setup_a".');
            }
        });

        it('emitted GAME_START game event', function () {
            expect(gameEvents.GAME_START).to.deep.equal([
                { message: 'The game has started.' }
            ]);
        });

        it('emitted TURN_CHANGE game event', function () {
            expect(gameEvents.TURN_CHANGE[0]).to.have.property('message');
            expect(gameEvents.TURN_CHANGE[0].message).to.match(/^The turn has changed to player/);
            expect(gameEvents.TURN_CHANGE[0]).to.have.property('playerId');
            expect(gameEvents.TURN_CHANGE[0].playerId).to.be.oneOf(options.players.map(player => player.id));
        });

        it('emitted PHASE_CHANGE game event', function () {
            const playerId = gameEvents.TURN_CHANGE[0].playerId;

            expect(gameEvents.PHASE_CHANGE[0]).to.have.property('message');
            expect(gameEvents.PHASE_CHANGE[0].message).to.match(/^The game phase has changed to "setup_a". Turn is to player/);
            expect(gameEvents.PHASE_CHANGE[0]).to.have.property('playerId');
            expect(gameEvents.PHASE_CHANGE[0].playerId).to.equal(playerId);
            expect(gameEvents.PHASE_CHANGE[0]).to.have.property('phase', 'setup_a');
        });

        it('emitted REQUIRE_TERRITORY_CLAIM player event', function () {
            const playerId = gameEvents.TURN_CHANGE[0].playerId;

            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0]).to.have.property('territoryIds');
            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].territoryIds).to.be.an('array');
            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0]).to.have.property('message');
            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].message).to.match(/^You must claim a territory. Available/);
            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0]).to.have.property('playerId');
            expect(playerEvents.REQUIRE_TERRITORY_CLAIM[0].playerId).to.equal(playerId);
        });
    });
});
