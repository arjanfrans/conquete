'use strict';

const chai = require('chai');
const expect = chai.expect;
const defaultOptions = require('../../lib/risk/utils/default-options');
const validateOptions = require('../../lib/risk/utils/options-validator');
const EventEmitter = require('events');

describe('options-validator', function () {
    it('succeed with a valid options object', function () {
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

        expect(optionErrors).to.equal(null);
    });
});
