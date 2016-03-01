'use strict';

const PHASE_METHODS = {
    setupA: ['claimTerritory'],
    setupB: ['deployOneUnit']
    placement: ['deployUnits', 'redeemCards', 'attackPhase'],
    attacking: ['attack', 'fortifyPhase', 'rollDice'],
    fortifying: ['moveUnits', 'endTurn']
};

const METHOD_ACCESS = {
    currentPlayer: ['deployUnits', 'redeemCards', 'attackPhase', 'attack', 'fortify', 'moveUnits', 'endTurn'],
    inBattle: ['rollDice']
};

function protectMethods (game, methods) {
    let wrappedMethods = {};

    Object.keys(methods).forEach(methodName => {
        let method = methods[methodName];

        Object.keys(PHASE_METHODS).forEach(phaseName => {
            let phaseMethods = PHASE_METHODS[phaseName];

            if (phaseMethods.indexOf(methodName) !== -1) {
                let wrappedMethod = function (playerId, ...args) {
                    if (game.phase !== phaseName) {
                        throw new Error('Not allowed in "' + game.phase + '"');
                    }

                    if (METHOD_ACCESS.currentPlayer.includes(methodName)) {
                        if (playerId !== game.currentPlayer.id) {
                            throw new Error('Not your turn');
                        }
                    }

                    if (METHOD_ACCESS.inBattle.includes(methodName)) {
                        if (playerId !== game.currentBattle.turnPlayer.id) {
                            throw new Error('Not your turn');
                        }
                    }

                    return method(playerId, ...args);
                }

                wrappedMethods[methodName] = wrappedMethod;
            }
        });
    });

    return Object.assign({}, methods, wrappedMethod);
}

module.exports = function (players, options) {
    const game = new Game(players, options);

    return protectMethods(gane, {
        claimTerritory (playerId, territoryId) {

        },

        deployOneUnit (playerId, territoryI) {
        },

        deployUnits (playerId, territoryId, units) {
        },

        redeemCards (playerId, cardIds) {
        }

        attackPhase (playerId) {

        },

        attack (playerId, fromTerritoryId, toTerritoryId, units) {
        },

        rollDice (playerId, numberOfDice) {
        }

        fortifyPhase (playerId) {
        }

        moveUnits (playerId, fromTerritoryId, toTerritoryId, units) {
        },

        endTurn (playerId) {
        }
    });
};
