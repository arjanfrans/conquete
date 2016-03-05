'use strict';

const Game = require('./risk/Game');
const validateOptions = require('./options-validator');

const PHASE_METHODS = {
    [Game.PHASES.SETUP_A]: ['claimTerritory'],
    [Game.PHASES.SETUP_B]: ['deployOneUnit'],
    [Game.TURN_PHASES.PLACEMENT]: ['deployUnits', 'redeemCards', 'attackPhase'],
    [Game.TURN_PHASES.ATTACKING]: ['attack', 'fortifyPhase', 'rollDice'],
    [Game.TURN_PHASES.FORTIFYING]: ['moveUnits', 'endTurn']
};

const METHOD_ACCESS = {
    currentPlayer: ['deployUnits', 'redeemCards', 'attackPhase', 'attack', 'fortifyPhase', 'moveUnits', 'endTurn'],
    inBattle: ['rollDice']
};

function protectMethods (game, methods) {
    let wrappedMethods = {};

    Object.keys(methods).forEach(methodName => {
        let method = methods[methodName];

        Object.keys(PHASE_METHODS).forEach(phaseName => {
            let phaseMethods = PHASE_METHODS[phaseName];

            if (phaseMethods.includes(methodName)) {
                function wrappedMethod (playerId, ...args) {
                    let player = game.players.get(playerId);

                    if (game.isGameOver()) {
                        throw new Error('Game has ended');
                    }

                    if (game.phase === Game.PHASES.BATTLE && game.turn.phase !== phaseName) {
                        throw new Error('Not allowed in "' + game.phase + ' ' + game.turn.phase + '"');
                    } else if (game.phase !== Game.PHASES.BATTLE && game.phase !== phaseName) {
                        throw new Error('Not allowed in "' + game.phase + '"');
                    }

                    if (METHOD_ACCESS.inBattle.includes(methodName)) {
                        if (playerId !== game.turn.battle.turn.id) {
                            throw new Error('Not your turn');
                        }
                    } else if (METHOD_ACCESS.currentPlayer.includes(methodName)) {
                        if (playerId !== game.turn.player.id) {
                            throw new Error('Not your turn');
                        }
                    }

                    return method(...args);
                };

                wrappedMethods[methodName] = wrappedMethod;
            }
        });
    });

    return Object.assign({}, methods, wrappedMethods);
}

function createActionMethods (game) {
    let methods = {
        deployOneUnit (territoryId) {

        },

        deployUnits (territoryId, units) {
        },

        moveUnits (fromId, toId, units) {
        },

        attack (fromId, toId, units) {

        },

        rollDice (numberOfDice) {
        },

        attackPhase () {
        },

        fortifyPhase () {
        },

        endTurn () {
        },
        redeemCards () {

        }
    };

    return protectMethods(game, methods);
}

function createInterface (game) {
    let risk = Object.seal({
        PHASES: Game.PHASES,
        TURN_PHASES: Game.TURN_PHASES,
        isGameOver () {

        },
        players: {},
        getPlayer (playerId) {

        },
        board: Object.seal({
            territories: {},
            continents: {},
            getContinent (continentId) {

            },
            getTerritory (territoryId) {

            }
        }),
        getCards (playerId) {},
        getAvailableUnits (playerId) {
            let player = game.players.get(playerId);

            return game.availableUnits(player);
        }
    });

    let act = Object.seal(createActionMethods(game));

    let utils = Object.seal({
        isValidCardCombo (...cards) {

        },
        ai: {}
    });

    return Object.assign(risk, {
        utils: utils
    });
}


function risk (options) {
    if (!validateOptions(options)) {
        process.exit(1);
    }

}

module.exports = risk;
