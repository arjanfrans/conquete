'use strict';

const test = require('ava');
const defaultOptions = require('../../lib/risk/utils/default-options');
const validateOptions = require('../../lib/risk/utils/options-validator');
const EventEmitter = require('events');

test('valid options object', function (t) {
    const playerListener = new EventEmitter();
    const options = Object.assign({}, defaultOptions, {
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
    });

    const optionErrors = validateOptions(options);

    t.is(optionErrors, null);
});


test('invalid options object', function (t) {
    const playerListener = new EventEmitter();
    const options = Object.assign({}, defaultOptions, {
        players: [
            {
                id: '1',
            },
            {
                id: '2',
                listener: playerListener
            }
        ]
    });

    const optionErrors = validateOptions(options)

    t.deepEqual(optionErrors, [
        'Property "players" does not meet minimum length of 3.',
        'Property "players[0]" requires property "listener".'
    ]);
});
