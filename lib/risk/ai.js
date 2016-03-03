'use strict';

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function ai(risk) {
    return {
        whichUnitsToMove (player) {
            let movement = [];

            for (let territoryId of player.territories) {
                 let territory = risk.info.territories[territoryId];

                if (territory.units > 1) {
                    territory.adjacentTerritories.map(adjacentTerritoryId => {
                        return risk.info.territories[adjacentTerritoryId];
                    }).forEach(adjacentTerritory => {
                        if (adjacentTerritory.owner === player.id && adjacentTerritory.units > 1) {
                            movement.push({
                                from: adjacentTerritory,
                                to: territory,
                                units: adjacentTerritory.units - 1
                            });
                        }
                    });
                }
            }

            return movement.filter(move => Math.random() > 0.6);
        },

        whereToDeployUnits (player) {
            let availableUnits = risk.act.availableUnits();
            let placements = [];

            while (availableUnits > 0) {
                let nearEnemy = [];
                let territories = player.territories.map(territoryId => {
                    return risk.info.territories[territoryId];
                });

                for (let territory of territories) {
                    territory.adjacentTerritories.forEach(adjacentTerritoryId => {
                        let adjacentTerritory = risk.info.territories[adjacentTerritoryId];

                        if (adjacentTerritory.owner !== player.id) {
                            nearEnemy.push(territory);
                        }
                    });
                }

                let units = Math.floor(Math.random() * availableUnits) + 1;

                availableUnits -= units;

                let placement = {
                    territory: randomValue(nearEnemy) || randomValue(territories),
                    units: units
                };

                placements.push(placement);
            }

            return placements;
        },

        whatToAttack (player) {
            let attack = [];

            for (let territoryId of player.territories) {
                let territory = risk.info.territories[territoryId];

                for (let adjacentTerritoryId of territory.adjacentTerritories) {
                    let adjacentTerritory = risk.info.territories[adjacentTerritoryId];

                    if (adjacentTerritory.owner !== player.id && territory.units > 1) {
                        attack.push({
                            from: territory,
                            to: adjacentTerritory,
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
