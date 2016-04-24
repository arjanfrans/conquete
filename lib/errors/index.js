'use strict';

const gameErrors = require('./game-errors');
const validationErrors = require('./validation-errors');

const ERRORS = Object.assign({}, gameErrors, validationErrors);

function createError (errorDefinition, data) {
    let message = null;

    if (typeof errorDefinition.message === 'function') {
        message = errorDefinition.message(data);
    } else {
        message = errorDefinition.message;
    }

    const err = new Error(message);

    err.name = errorDefinition.name;
    err.data = data || {};

    return err;
}

module.exports = {
    createError,
    ERRORS
};
