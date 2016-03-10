'use strict';

const debug = require('debug')('risk:index');
const Game = require('./Game');
const constants = require('./contstants');
const PHASES = constants.PHASES;
const eventTypes = require('./event-types');

const EVENTS = eventTypes.EVENTS;
const PLAYER_EVENTS = eventTypes.PLAYER_EVENTS;

const fs = require('fs');
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
const EventEmitter = require('events');

class PlayerEmitter extends EventEmitter {}

class ActionEmitter extends EventEmitter {}


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
                        if (!game.turn.battle || playerId !== game.turn.battle.turn.id) {
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
        claimTerritory (territoryId) {
            let territory = getTerritory(territoryId);

            game.claimTerritory(territory);
        },
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
    let ai = Ai(game);
    let getPlayer = (playerId) => {
        let player = game.players.get(playerId);

        if (!player) {
            throw new Error('Player does not exist');
        }

        return player;
    }

    let risk = {
        PHASES: PHASES,
        TURN_PHASES: TURN_PHASES,
        saveState () {
            let output = game.state.toJSON();

            fs.writeFile('./risk_state', JSON.stringify(output, null, 4), err => {
                if (err) {
                    return console.log(err);
                }

                console.log('game saved');
            });
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

            return {
                players: [battle.attacker.id, battle.defender.id],
                currentPlayer: battle.turn.id,
                attacker: {
                    player: battle.attacker.id,
                    units: battle.attackUnits,
                    dice: battle.attackDice
                },
                defender: {
                    player: battle.defender.id,
                    units: battle.defendUnits,
                    dice: battle.defendDice
                },
                from: battle.from.id,
                to: battle.to.id,
            };
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
    };

    let act = Object.seal(createActionMethods(game));

    let utils = Object.seal({
        isValidCardCombo (cards) {
            return cardValidator.isValidCombo(options.cardBonus, cards);
        },
        ai: ai
    });

    return Object.seal(Object.assign(risk, {
        act: act,
        utils: utils
    }));
}

function risk (gameEmitter, options, state) {
    if (!validateOptions(options)) {
        return;
    }

    let game = new Game(options, state);

    let playerEmitters = {};

    for (let i = 0; i < options.players.length; i++) {
        if (options.players[i].events) {
            playerEmitters[i] = options.players[i].events;
        }
    }

    game.setEventEmitters(gameEmitter, playerEmitters);

    return createInterface(options, game);
}

module.exports = risk;
