'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');

describe('initialize game', function () {
    it('initialize game', function () {
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

        // game.start();
        //
        // const forbiddenActions = Object.entries(risk.PHASE_METHODS).reduce((prev, [phase, methods]) => {
        //     return phase !== 'setup_a' ? prev.concat(methods) : prev;
        // }, []);
        //
        // for (const actionName of forbiddenActions) {
        //     t.throws(() => game.act[actionName](), 'Action is not allowed in game phase "setup_a".');
        // }
    });
});

