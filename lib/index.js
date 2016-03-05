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
const cardValidator = require('./risk/card-validator');
const Ai = require('./risk/ai');

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
    // let ai = Ai(game);
    let getPlayer = (playerId) => {
        let player = game.players.get(playerId);

        if (!player) {
            throw new Error('Player does not exist');
        }

        return player;
    }

    let risk = Object.seal({
        PHASES: Game.PHASES,
        TURN_PHASES: Game.TURN_PHASES,
        isGameOver () {
            return game.isGameOver();
        },
        get players () {
            return Array.from()
        }
        getPlayer (playerId) {
            return getPlayer(playerId);
        },
        board: Object.seal({
            get territories () {
                return Array.from(game.board.territories.values()).map(territory => {
                    return territory.toJSON();
                });
            },
            continents () {
                return Array.from(game.board.continents.values()).map(continent => {
                    return continent.toJSON();
                });
            },
            getContinent (continentId) {
                return game.board.getContinentById(territoryId);
            },
            getTerritory (territoryId) {
                return game.board.getTerritoryById(territoryId);
            }
        }),
        getCards (playerId) {
            let player = getPlayer(playerId);

            return Array.from(player.cards);
        },
        getAvailableUnits (playerId) {
            let player = getPlayer(playerId);

            return game.availableUnits(player);
        }
    });

    let act = Object.seal(createActionMethods(game));

    let utils = Object.seal({
        isValidCardCombo (cards) {
            return cardValidator.isValidCombo(cards);
        },
        // ai: ai
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
