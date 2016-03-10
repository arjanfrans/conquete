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
                    return console.log('error saving state', err);
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

    debugGameEvents(gameEmitter);

    for (let i = 0; i < options.players.length; i++) {
        if (options.players[i].events) {
            playerEmitters[i] = options.players[i].events;
            debugPlayerEvents(playerEmitters[i]);
        }
    }

    game.setEventEmitters(gameEmitter, playerEmitters);

    return createInterface(options, game);
}

function debugPlayerEvents (eventEmitter, playerId) {
    playerId = Number.parseInt(playerId, 10);

    eventEmitter.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
        debug(`${playerId} - ${data.type} dice roll required, ${data.maxDice} dice available`);
    });

    eventEmitter.on(PLAYER_EVENTS.NEW_CARD, data => {
        debug(`${playerId} - new card received: ${data.card}`);
    });

    eventEmitter.on(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
        debug(`${playerId} - claim a territory: ${data.availableTerritoryIds.join(', ')}`);
    });

    eventEmitter.on(PLAYER_EVENTS.QUEUED_MOVE, data => {
        debug(`${playerId} - ${data.units} units queued to move from ${data.from} to ${data.to}`);
    });

    eventEmitter.on(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
        debug(`${playerId} - deploy 1 unit to one of your territitories (${data.availableUnits} units remaining)`);
    });

    eventEmitter.on(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
        debug(`${playerId} - redeem cards and deploy units (${data.availableUnits} units available)`);
    });

    eventEmitter.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
        debug(`${playerId} - attack or continue to fortify`);
    });

    eventEmitter.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
        debug(`${playerId} - move units or end your turn`);
    });
};

function debugGameEvents (eventEmitter) {
    eventEmitter.on(EVENTS.GAME_START, () => {
        debug('game started');
    });

    eventEmitter.on(EVENTS.TURN_CHANGE, data => {
        debug(`turn changed to player ${data.playerId}`);
    });

    eventEmitter.on(EVENTS.PHASE_CHANGE, data => {
        debug(`game phase changed to ${data.phase}`);
    });

    eventEmitter.on(EVENTS.TURN_PHASE_CHANGE, data => {
        debug(`turn phase changed to ${data.phase}`);
    });

    eventEmitter.on(EVENTS.TERRITORY_CLAIMED, data => {
        debug(`territory ${data.territoryId} claimed by player ${data.playerId}`);
    });

    eventEmitter.on(EVENTS.DEPLOY_UNITS, data => {
        debug(`${data.units} units deployed in territory ${data.territoryId} by player ${data.playerId}`);
    });

    eventEmitter.on(EVENTS.ATTACK, data => {
        debug('attack initiated', data);
    });

    eventEmitter.on(EVENTS.ATTACK_DICE_ROLL, data => {
        debug(`attacker rolled dice: ${data.dice.join(', ')}`);
    });

    eventEmitter.on(EVENTS.REDEEM_CARDS, data => {
        debug(`player ${data.playerId} redeemed cards: ${data.cards.join(', ')} (bonus: ${data.bonus})`);
    });

    eventEmitter.on(EVENTS.DEFEND_DICE_ROLL, data => {
        debug(`defender rolled dice: ${data.dice.join(', ')}`);

        let res = data.results;

        if (res.attackKilled > 0) {
            debug(`attacker units killed: ${res.attackKilled}`);
        }

        if (res.defendKilled > 0) {
            debug(`defender units killed: ${res.defendKilled}`);
        }

        debug(`attacker units remaining ${res.attackRemaining}, defender units remaining ${res.defendRemaining}`);
    });

    eventEmitter.on(EVENTS.BATTLE_END, data => {
        let attack = data.type === 'attack' ? 'attacking' : 'defending';

        debug(`battle ended, ${attack} player ${data.winner} won`);
    });

    eventEmitter.on(EVENTS.MOVE_UNITS, data => {
        for (let move of data.movements) {
            debug(`${move.units} units moved by player ${data.playerId} from ${move.from} to ${move.to}`);
        }
    });

    eventEmitter.on(EVENTS.GAME_END, data => {
        debug(`game has ended, winner: ${data.winner}`);
    });
}



module.exports = risk;
