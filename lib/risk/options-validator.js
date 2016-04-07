'use strict';

const Validator = require('jsonschema').Validator;
const v = new Validator();

const CARD_TYPES = ['cavalry', 'infantry', 'artillery', 'joker'];

const MAP_SCHEMA = {
    type: 'object',
    properties: {
        territories: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    continentId: { type: 'string' },
                    adjacentTerritoryIds: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                },
                required: ['id', 'name', 'continentId', 'adjacentTerritoryIds']
            }
        },
        continents: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    bonus: { type: 'integer'},
                    territoryIds: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                },
                equired: ['id', 'name', 'bonus', 'territoryIds']
            }
        }
    },
    required: true
};

const SCHEMA = {
    type: 'object',
    properties: {
        debug: {
            type: 'boolean'
        },
        state: {
            type: 'object'
        },
        map: MAP_SCHEMA,
        players: {
            type: 'array',
            minItems: 3,
            maxItems: 6,
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    listener: { type: 'object' }
                },
                required: ['id', 'listener']
            },
            uniqueItems: true
        },
        cardBonus: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    cards: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: CARD_TYPES
                        }
                    },
                    bonus: {
                        type: 'integer',
                        minimum: 0
                    }
                }
            }
        }
    },
    required: ['players', 'cardBonus']
};

function validateOptions (options) {
    v.addSchema(SCHEMA, '/Options');

    const result = v.validate(options, SCHEMA);

    if (!result.valid) {
        const errors = result.errors.map(error => {
            const property = error.property.replace(/^instance\./, '');
            const message = `Property "${property}" ${error.message}`;

            return message;
        });

        return errors;
    }

    return null;
}

module.exports = validateOptions;
