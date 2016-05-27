'use strict';

const Game = require('./Game');
const maps = require('../maps');
const constants = require('./constants');
const defaultOptions = require('./utils/default-options');
const PHASES = constants.PHASES;
const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

const TURN_PHASES = constants.TURN_PHASES;
const validateOptions = require('./utils/options-validator');

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
const Ai = require('./ai/ai');

const debugEvents = require('./debug-events');
const debugGameEvents = debugEvents.debugGameEvents;
const debugPlayerEvents = debugEvents.debugPlayerEvents;

function checkTurn (methodName, game, playerId) {
    if (METHOD_ACCESS.inBattle.includes(methodName)) {
        if (!game.turn.battle) {
            throw createError(ERRORS.NoBattleError);
        } else if (playerId !== game.turn.battle.getTurn().getId()) {
            throw createError(ERRORS.BattleTurnError, {
                battleTurn: game.turn.battle.getTurn().getId()
            });
        }
    } else if (METHOD_ACCESS.currentPlayer.includes(methodName)) {
        if (playerId !== game.turn.player.getId()) {
            throw createError(ERRORS.TurnError, {
                turn: game.turn.player.getId()
            });
        }
    }
}

function createProtectedMethod (methodName, method, game, phaseName) {
    return function wrappedMethod (playerId, ...args) {
        if (!game.started) {
            throw createError(ERRORS.GameNotStartedError);
        }

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

        checkTurn(methodName, game, playerId);

        return method(...args);
    };
}

function protectMethods (game, methods) {
    const wrappedMethods = {};

    Object.keys(methods).forEach(methodName => {
        const method = methods[methodName];

        Object.keys(PHASE_METHODS).forEach(phaseName => {
            const phaseMethods = PHASE_METHODS[phaseName];

            if (phaseMethods.includes(methodName)) {
                wrappedMethods[methodName] = createProtectedMethod(methodName, method, game, phaseName);
            }
        });
    });

    return Object.assign({}, methods, wrappedMethods);
}

function createActionMethods (game) {
    const getTerritory = (territoryId) => {
        const territory = game.board.getTerritoryById(territoryId);

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
        const player = game.players.get(playerId);

        if (!player) {
            throw createError(ERRORS.InvalidPlayerError, { playerId });
        }

        return player;
    };

    const risk = {
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

            const battle = game.turn.battle;

            return battle.toJSON();
        },
        get players () {
            return Array.from(game.players.values()).map(player => player.toJSON({
                hide: ['cards', 'startUnits']
            }));
        },
        getPlayer (playerId) {
            return getPlayer(playerId).toJSON({
                hide: ['cards', 'startUnits']
            });
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
                return game.board.getTerritories().map(territory => {
                    return territory.toJSON();
                });
            },
            getAdjacentTerritories (territoryId, sameOwner) {
                const territory = game.board.getTerritoryById(territoryId);

                if (sameOwner) {
                    return territory.ownAdjacentTerritories().map(territory => territory.toJSON());
                }

                return territory.enemyAdjacentTerritories().map(territory => territory.toJSON());
            },
            getAvailableTerritories () {
                return game.board.getAvailableTerritories().map(territory => {
                    return territory.toJSON();
                });
            },
            getContinents () {
                return game.board.getContinents().map(continent => {
                    return continent.toJSON();
                });
            },
            getContinent (continentId) {
                const continent = game.board.getContinentById(continentId);

                return continent.toJSON();
            },
            getTerritory (territoryId) {
                const territory = game.board.getTerritoryById(territoryId);

                return territory.toJSON();
            }
        }),
        getCards (playerId) {
            const player = getPlayer(playerId);

            return player.getCards();
        },
        getAvailableUnits (playerId) {
            const player = getPlayer(playerId);

            return game.availableUnits(player);
        }
    };

    const act = Object.seal(createActionMethods(game));

    const utils = Object.seal({
        isValidCardCombo (cards) {
            return game.getState().getCardManager().isValidCombo(cards);
        },
        validCardCombos () {
            return options.cardBonus.map(bonus => bonus.cards);
        },
        ai: ai
    });

    risk.act = act;
    risk.utils = utils;
    risk.options = Object.seal(Object.assign({}, options));

    return Object.seal(risk);
}

function risk (customOptions, state) {
    const options = Object.assign({}, defaultOptions, customOptions);
    const optionErrors = validateOptions(options);

    if (optionErrors) {
        throw createError(ERRORS.OptionsValidationError, { errors: optionErrors });
    }

    const game = new Game(options, state);

    const gameEmitter = options.listener;
    const playerEmitters = {};

    for (const player of options.players) {
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
}, constants, { PHASE_METHODS });
