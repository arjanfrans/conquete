'use strict';

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function ai (game) {
    return {
        whichUnitsToMove (playerId) {
            const player = game.players.get(playerId);
            const movement = [];

            for (const territory of player.getTerritories()) {
                for (const adjacentTerritory of territory.ownAdjacentTerritories()) {
                    if (territory.getUnits() > 1) {
                        movement.push({
                            from: territory.toJSON(),
                            to: adjacentTerritory.toJSON(),
                            units: territory.getUnits() - 1
                        });
                    }
                }
            }

            return movement.filter(() => Math.random() > 0.6);
        },

        whereToDeployUnits (playerId) {
            const player = game.players.get(playerId);
            let availableUnits = game.availableUnits(player);
            const placements = [];

            while (availableUnits > 0) {
                const nearEnemy = [];

                for (const territory of player.getTerritories()) {
                    if (territory.enemyAdjacentTerritories().length > 0) {
                        nearEnemy.push(territory.toJSON());
                    }
                }

                const units = Math.floor(Math.random() * availableUnits) + 1;

                availableUnits -= units;

                const placement = {
                    territory: randomValue(nearEnemy) || randomValue(player.getTerritories()),
                    units: units
                };

                placements.push(placement);
            }

            return placements;
        },

        whatToAttack (playerId) {
            const player = game.players.get(playerId);
            const attack = [];

            for (const territory of player.getTerritories()) {
                if (territory.getUnits() > 1) {
                    for (const enemyTerritory of territory.enemyAdjacentTerritories()) {
                        attack.push({
                            from: territory.toJSON(),
                            to: enemyTerritory.toJSON(),
                            units: territory.getUnits() - 1
                        });
                    }
                }
            }

            return randomValue(attack);
        }
    };
}

module.exports = ai;
