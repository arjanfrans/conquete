'use strict';

const test = require('ava');
const EventEmitter = require('events');
const risk = require('../../lib/risk');

test('initialize game', function (t) {
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

    t.is(game.phase, 'setup_a');
    t.is(game.turnPhase, 'placement');
    t.false(game.isGameOver());
    t.is(game.players.length, 3);
    t.is(game.getAvailableUnits('1'), 35);
    t.is(game.battle, null);
    t.deepEqual(game.getPlayer('2'), {
        id: '2',
        dead: false,
        territoryIds: [],
        cardsCount: 0
    });

    for (const action of Object.values(game.act)) {
        t.throws(() => action(), 'Game has not started.');
    }

    game.start();

    const forbiddenActions = Object.entries(risk.PHASE_METHODS).reduce((prev, [phase, methods]) => {
        return phase !== 'setup_a' ? prev.concat(methods) : prev;
    }, []);

    for (const actionName of forbiddenActions) {
        t.throws(() => game.act[actionName](), 'Action is not allowed in game phase "setup_a".');
    }
});
