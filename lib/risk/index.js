'use strict';

const Game = require('./Game');
const debug = require('debug')('risk:index');

const PHASE_METHODS = {
    [Game.PHASES.SETUP_A]: ['claimTerritory'],
    [Game.PHASES.SETUP_B]: ['deployOneUnit'],
    [Game.TURN_PHASES.PLACEMENT]: ['deployUnits', 'redeemCards', 'attackPhase', 'availableUnits'],
    [Game.TURN_PHASES.ATTACKING]: ['attack', 'fortifyPhase', 'rollDice'],
    [Game.TURN_PHASES.FORTIFYING]: ['moveUnits', 'endTurn']
};
console.log(PHASE_METHODS)

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

            if (phaseMethods.includes(methodName)) {
                let wrappedMethod = function (playerId, ...args) {
                    let player = game.players.get(playerId);

                    if (game.phase === Game.PHASES.BATTLE && game.turn.phase !== phaseName) {
                        throw new Error('Not allowed in "' + game.phase + ' ' + game.turn.phase + '"');
                    } else if (game.phase !== Game.PHASES.BATTLE && game.phase !== phaseName) {
                        throw new Error('Not allowed in "' + game.phase + '"');
                    }

                    if (METHOD_ACCESS.currentPlayer.includes(methodName)) {
                        if (playerId !== game.turn.player.id) {
                            throw new Error('Not your turn');
                        }
                    }

                    if (METHOD_ACCESS.inBattle.includes(methodName)) {
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

module.exports = function (players, options) {
    const game = new Game(players, options);

    let actMethods = protectMethods(game, {
        claimTerritory (territoryId) {
            let territory = game.board.territories.get(territoryId);

            game.claimTerritory(territory);
        },

        deployOneUnit (territoryId) {
            let territory = game.board.territories.get(territoryId);

            game.deployOneUnit(territory);
        },

        availableUnits () {
            return game.availableUnits();
        },

        deployUnits (territoryId, units) {
            let territory = game.board.territories.get(territoryId);

            game.deployUnits(territory, units);
        },

        redeemCards (cardIds) {
            let cards = cardIds.map(cardId => game.cards.get(cardId));

            game.redeemCards(cards);
        },

        attackPhase () {
            game.attackPhase();
        },

        attack (fromTerritoryId, toTerritoryId, units) {
            let from = game.board.territories.get(fromTerritoryId);
            let to = game.board.territories.get(toTerritoryId);

            game.attack(from, to, units);
        },

        rollDice (numberOfDice) {
            game.rollDice(numberOfDice);
        },

        fortifyPhase () {
            game.fortifyPhase();
        },

        moveUnits (fromTerritoryId, toTerritoryId, units) {
            let from = game.board.territories.get(fromTerritoryId);
            let to = game.board.territories.get(toTerritoryId);

            game.moveUnits(from, to, units);
        },

        endTurn () {
            game.endTurn();
        }
    });

    let infoMethods = {
        get availableTerritories () {
            let territories = Array.from(game.board.territories.values());

            return territories.filter(territory => {
                return !territory.occupyingPlayer;
            }).map(territory => territory.toJSON());
        },

        get territories () {
            let territories = Array.from(game.board.territories.values());

            return territories.map(territory => {
                return territory.toJSON();
            });
        },

        get continents () {
            return Array.from(game.board.continents.values()).map(continent => continent.toJSON());
        },

        get PHASES () {
            return Game.PHASES;
        },

        get phase () {
            return game.phase;
        },

        get players () {
            return Array.from(game.players.values()).map(player => {
                let territories = Array.from(game.board.territories.values()).filter(territory => {
                    return territory.occupyingPlayer === player;
                }).map(territory => territory.id);

                let continents = Array.from(game.board.continents.values()).filter(continent => {
                    return continent.occupyingPlayer === player;
                }).map(continent => continent.id);

                return Object.assign(player.toJSON(), {
                    territories: territories,
                    continents: continents
                });
            });
        }
    };

    return {
        start: () => game.start(),

        get currentPlayer () {
            // TODO abstract this away
            let territories = Array.from(game.board.territories.values()).filter(territory => {
                return territory.occupyingPlayer === game.turn.player;
            }).map(territory => territory.id);

            let continents = Array.from(game.board.continents.values()).filter(continent => {
                return continent.occupyingPlayer === game.turn.player;
            }).map(continent => continent.id);

            return Object.assign(game.turn.player.toJSON(), {
                territories: territories,
                continents: continents
            });
        },

        info: infoMethods,
        act: actMethods
    };
};
