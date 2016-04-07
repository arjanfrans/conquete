'use strict';

const Game = require('./Game');
const maps = require('../../maps');
const constants = require('./constants');
const PHASES = constants.PHASES;
const errors = require('./errors');
const createError = errors.createError;
const ERRORS = errors.ERRORS;

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
const cardValidator = require('./card-validator');
const Ai = require('./ai/ai');

const debugEvents = require('./debug-events');
const debugGameEvents = debugEvents.debugGameEvents;
const debugPlayerEvents = debugEvents.debugPlayerEvents;

function createProtectedMethod (methodName, method, game, phaseName) {
    return function wrappedMethod (playerId, ...args) {
        if (game.isGameOver()) {
            throw createError(ERRORS.GameEndedError);
        }

        if (game.phase === PHASES.BATTLE && game.turn.phase !== phaseName) {
            throw createError(ERRORS.TurnPhaseActionError, {
                phase: game.phase,
                turnPhase: game.turn.phase
            });
        } else if (game.phase !== PHASES.BATTLE && game.phase !== phaseName) {
            throw createError(ERRORS.PhaseActionError, {
                phase: game.phase
            });
        }

        if (METHOD_ACCESS.inBattle.includes(methodName)) {
            if (!game.turn.battle) {
                throw createError(ERRORS.NoBattleError);
            } else if (playerId !== game.turn.battle.turn.id) {
                throw createError(ERRORS.BattleTurnError, {
                    battleTurn: game.turn.battle.turn.id
                });
            }
        } else if (METHOD_ACCESS.currentPlayer.includes(methodName)) {
            if (playerId !== game.turn.player.id) {
                throw createError(ERRORS.TurnError, {
                    turn: game.turn.player.id
                });
            }
        }

        return method(...args);
    };
}

function protectMethods (game, methods) {
    let wrappedMethods = {};

    Object.keys(methods).forEach(methodName => {
        let method = methods[methodName];

        Object.keys(PHASE_METHODS).forEach(phaseName => {
            let phaseMethods = PHASE_METHODS[phaseName];

            if (phaseMethods.includes(methodName)) {
                wrappedMethods[methodName] = createProtectedMethod(methodName, method, game, phaseName);
            }
        });
    });

    return Object.assign({}, methods, wrappedMethods);
}

function createActionMethods (game) {
    const getTerritory = (territoryId) => {
        const territory = game.board.territories.get(territoryId);

        if (!territory) {
            throw createError(ERRORS.InvalidTerritoryError, { territoryId });
        }

        return territory;
    };

    const methods = {
        claimTerritory (territoryId) {
            const territory = getTerritory(territoryId);

            game.claimTerritory(territory);
        },
        deployOneUnit (territoryId) {
            const territory = getTerritory(territoryId);

            game.deployOneUnit(territory);
        },

        deployUnits (territoryId, units) {
            const territory = getTerritory(territoryId);

            game.deployUnits(territory, Number.parseInt(units, 10));
        },

        moveUnits (fromId, toId, units) {
            const from = getTerritory(fromId);
            const to = getTerritory(toId);

            game.moveUnits(from, to, Number.parseInt(units, 10));
        },

        attack (fromId, toId, units) {
            const from = getTerritory(fromId);
            const to = getTerritory(toId);

            game.attack(from, to, Number.parseInt(units, 10));
        },

        rollDice (numberOfDice) {
            game.rollDice(Number.parseInt(numberOfDice, 10));
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

function createInterface (options, game) {
    const ai = Ai(game);

    const getPlayer = (playerId) => {
        let player = game.players.get(playerId);

        if (!player) {
            throw createError(ERRORS.InvalidPlayerError, { playerId });
        }

        return player;
    };

    let risk = {
        PHASES: PHASES,
        TURN_PHASES: TURN_PHASES,
        get state () {
            return game.state.toJSON();
        },
        start () {
            game.start();
        },
        isGameOver () {
            return game.isGameOver();
        },
        get phase () {
            return game.phase;
        },
        get turnPhase () {
            return game.turnPhase;
        },
        get battle () {
            if (!game.turn.battle) {
                return null;
            }

            let battle = game.turn.battle;

            return battle.toJSON();
        },
        get players () {
            return Array.from(game.players.values()).map(player => player.toJSON({
                hide: ['cards', 'startUnits']
            }));
        },
        getPlayer (playerId) {
            return getPlayer(playerId).toJSON();
        },
        get currentPlayer () {
            if (game.turn.player) {
                return game.turn.player.toJSON({
                    hide: ['cards', 'startUnits']
                });
            }

            return null;
        },
        board: Object.seal({
            getTerritories () {
                return Array.from(game.board.territories.values()).map(territory => {
                    return territory.toJSON();
                });
            },
            getAvailableTerritories () {
                return game.board.getAvailableTerritories().map(territory => {
                    return territory.toJSON();
                });
            },
            getContinents () {
                return Array.from(game.board.continents.values()).map(continent => {
                    return continent.toJSON();
                });
            },
            getContinent (continentId) {
                return game.board.getContinentById(continentId);
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
    };

    let act = Object.seal(createActionMethods(game));

    let utils = Object.seal({
        isValidCardCombo (cards) {
            return cardValidator.isValidCombo(options.cardBonus, cards);
        },
        ai: ai
    });

    risk.act = act;
    risk.utils = utils;

    return Object.seal(risk);
}

function risk (gameEmitter, options, state) {
    const optionErrors = validateOptions(options);

    if (optionErrors) {
        throw createError(ERRORS.OptionsValidationError, { errors: optionErrors });
    }

    const game = new Game(options, state);

    let playerEmitters = {};

    for (let player of options.players) {
        playerEmitters[player.id] = player.listener;

        if (options.debug) {
            debugPlayerEvents(player.listener, player.id);
        }
    }

    if (options.debug) {
        debugGameEvents(gameEmitter);
    }

    game.setEventEmitters(gameEmitter, playerEmitters);

    return createInterface(options, game);
}

module.exports = Object.assign({}, {
    Game: risk,
    maps: maps,
}, constants);
