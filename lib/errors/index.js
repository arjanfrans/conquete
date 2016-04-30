'use strict';

const createDefinitions = require('strict-errors').createDefinitions;
const gameErrors = require('./game-errors');
const validationErrors = require('./validation-errors');

module.exports = createDefinitions(Object.assign({}, gameErrors, validationErrors));
