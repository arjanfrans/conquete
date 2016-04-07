'use strict';

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function ai (game) {
    return {
        whichUnitsToMove (playerId) {
            let player = game.players.get(playerId);
            let movement = [];

            for (let territory of player.territories) {
                for (let adjacentTerritory of territory.ownAdjacentTerritories()) {
                    if (territory.units > 1) {
                        movement.push({
                            from: territory.toJSON(),
                            to: adjacentTerritory.toJSON(),
                            units: territory.units - 1
                        });
                    }
                }
            }

            return movement.filter(move => Math.random() > 0.6);
        },

        whereToDeployUnits (playerId) {
            let player = game.players.get(playerId);
            let availableUnits = game.availableUnits(player);
            let placements = [];

            while (availableUnits > 0) {
                let nearEnemy = [];

                for (let territory of player.territories.values()) {
                    if (territory.enemyAdjacentTerritories().length > 0) {
                        nearEnemy.push(territory.toJSON());
                    }
                }

                let units = Math.floor(Math.random() * availableUnits) + 1;

                availableUnits -= units;

                let placement = {
                    territory: randomValue(nearEnemy) || randomValue(Array.from(player.territories.values())),
                    units: units
                };

                placements.push(placement);
            }

            return placements;
        },

        whatToAttack (playerId) {
            let player = game.players.get(playerId);
            let attack = [];

            for (let territory of player.territories) {
                if (territory.units > 1) {
                    for (let enemyTerritory of territory.enemyAdjacentTerritories()) {
                        attack.push({
                            from: territory.toJSON(),
                            to: enemyTerritory.toJSON(),
                            units: territory.units - 1
                        });
                    }
                }
            }

            return randomValue(attack);
        }
    };
}

module.exports = ai;
