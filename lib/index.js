'use strict';

const Game = require('./risk/Game');
const constants = require('./risk/contstants');
const PHASES = constants.PHASES;
const TURN_PHASES = constants.TURN_PHASES;
const validateOptions = require('./options-validator');

const PHASE_METHODS = {
    [PHASES.SETUP_A]: ['claimTerritory'],
    [PHASES.SETUP_B]: ['deployOneUnit'],
    [TURN_PHASES.PLACEMENT]: ['deployUnits', 'redeemCards', 'attackPhase'],
    [TURN_PHASES.ATTACKING]: ['attack', 'fortifyPhase', 'rollDice'],
    [TURN_PHASES.FORTIFYING]: ['moveUnits', 'endTurn']
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

                    if (game.phase === PHASES.BATTLE && game.turn.phase !== phaseName) {
                        throw new Error('Not allowed in "' + game.phase + ' ' + game.turn.phase + '"');
                    } else if (game.phase !== PHASES.BATTLE && game.phase !== phaseName) {
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
    let getTerritory = (territoryId) => {
        let territory = game.board.territories.get(territoryId);

        if (!territory) {
            throw new Error('Invalid territory');
        }

        return territory;
    };

    let methods = {
        deployOneUnit (territoryId) {
            let territory = getTerritory(territoryId);

            game.deployOneUnit(territory);
        },

        deployUnits (territoryId, units) {
            let territory = getTerritory(territoryId);

            game.deployUnits(territory, Number.parseInt(units, 10));
        },

        moveUnits (fromId, toId, units) {
            let from = getTerritory(fromId);
            let to = getTerritory(toId);

            game.moveUnits(from, to, Number.parseInt(units, 10));
        },

        attack (fromId, toId, units) {
            let from = getTerritory(fromId);
            let to = getTerritory(toId);

            game.attack(from, to, Number.parseInt(units, 10));
        },

        rollDice (numberOfDice) {
            game.rollDice(numberOfDice);
        },

        attackPhase () {
            game.attackPhase();
        },

        fortifyPhase () {
            game.fortifyPhase();
        },

        endTurn () {
            game.endTurn();
        },
        redeemCards (cards) {
            game.redeemCards(cards);
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
        PHASES: PHASES,
        TURN_PHASES: TURN_PHASES,
        start () {
            game.start();
        },
        isGameOver () {
            return game.isGameOver();
        },
        get players () {
            return Array.from()
        }
        getPlayer (playerId) {
            return getPlayer(playerId).toJSON();
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


function risk (options, state) {
    if (!validateOptions(options)) {
        return;
    }

    let game = new Game(options, state);

    return createInterface(game);
}

module.exports = risk;