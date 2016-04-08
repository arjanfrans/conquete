'use strict';

const test = require('ava');
const EventEmitter = require('events');
const risk = require('../../lib/risk');

test.skip('initialize game', function (t) {
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

    const game = risk.Game(options);
    console.log(game);
});
