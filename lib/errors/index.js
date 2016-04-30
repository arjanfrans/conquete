'use strict';

const createErrorDefinitions = require('strict-errors').createErrorDefinitions;
const gameErrors = require('./game-errors');
const validationErrors = require('./validation-errors');

module.exports = createErrorDefinitions(Object.assign({}, gameErrors, validationErrors));
