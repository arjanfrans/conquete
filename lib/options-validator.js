'use strict';

const Validator = require('jsonschema').Validator;
const v = new Validator();

const MODES = ['classic'];
const CARD_TYPES = ['cavalry', 'infantry', 'artillery', 'joker'];

const schema = {
    type: 'object',
    properties: {
        state: {
            type: 'object',
            required: false
        },
        mode: {
            enum: MODES,
            required: true
        },
        players: {
            type: 'array',
            minItems: 3,
            maxItems: 6,
            items: {
                type: 'object'
            },
            uniqueItems: true,
            required: true
        },
        cardBonus: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    cards: {
                        type: 'array',
                        items: {
                            enum: CARD_TYPES
                        }
                    },
                    bonus: {
                        type: 'integer',
                        minimum: 0
                    }
                }
            },
            required: false
        }
    }
}

function validateOptions (options) {
    let result = v.validate(options, schema);

    if (!result.valid) {
        console.log(result.errors.map(err => {
            return '- ' + err.stack;
        }).join('\n'));

        return false;
    }

k   return true;
}

module.exports = validateOptions;
