'use strict';

const risk = require('../../lib/risk');
const expect = require('chai').expect;
const defaultOptions = require('../../lib/risk/utils/default-options');
const validateOptions = require('../../lib/risk/utils/options-validator');
const EventEmitter = require('events');

describe('options-validator', function () {
    it('valid options object', function () {
        const gameListener = new EventEmitter();
        const playerListener = new EventEmitter();

        const options = Object.assign({}, defaultOptions, {
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
        });

        const optionErrors = validateOptions(options);

        expect(optionErrors).to.equal(null);
    });

    it('invalid options object', function () {
        const playerListener = new EventEmitter();
        const gameListener = new EventEmitter();

        const options = Object.assign({}, defaultOptions, {
            listener: gameListener,
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

        const optionErrors = validateOptions(options);

        expect(optionErrors).to.deep.equal([
            'Property "players" does not meet minimum length of 3.',
            'Property "players[0]" requires property "listener".'
        ]);
    });

    it('invalid options object in game', function () {
        const playerListener = new EventEmitter();
        const gameListener = new EventEmitter();

        const options = Object.assign({}, defaultOptions, {
            listener: gameListener,
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


        try {
            risk.Game(options);
        } catch (err) {
            expect(err.name).to.equal('OptionsValidationError');
            expect(err.data).to.deep.equal({
                errors: [
                    'Property "players" does not meet minimum length of 3.',
                    'Property "players[0]" requires property "listener".'
                ]
            });
        }
    });
});
