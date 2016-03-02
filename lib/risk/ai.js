'use strict';

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function ai(risk) {
    return {
        whereToDeployUnits (player) {
            let availableUnits = risk.act.availableUnits();
            let placements = [];

            while (availableUnits > 0) {
                let nearEnemy = [];

                for (let territoryId of player.territories) {
                     let territory = risk.info.territories.find(territory => {
                        return territory.id === territoryId;
                    });

                    territory.adjacentTerritories.forEach(adjacentTerritoryId => {
                        let adjacentTerritory = risk.info.territories.find(territory => {
                            return territory.id === adjacentTerritoryId;
                        });

                        if (adjacentTerritory.owner !== player.id) {
                            nearEnemy.push(territory);
                        }
                    });
                }

                let units = Math.floor(Math.random() * availableUnits) + 1;

                availableUnits -= units;

                let placement = {
                    territory: randomValue(nearEnemy),
                    units: units
                };

                placements.push(placement);
            }

            return placements;
        },

        whatToAttack (player) {
            let attack = [];

            for (let territoryId of player.territories) {
                let territory = risk.info.territories.find(territory => {
                    return territory.id === territoryId;
                });

                for (let adjacentTerritoryId of territory.adjacentTerritories) {
                    let adjacentTerritory = risk.info.territories.find(territory => {
                        return territory.id === adjacentTerritoryId;
                    });

                    if (adjacentTerritory.owner !== player.id && territory.units > 1) {
                        attack.push({
                            from: territory,
                            to: adjacentTerritory,
                            units: territory.units - 1
                        });
                    }
                }
            }

            return randomValue(attack) || randomValue(player.territories);
        }
    };
}

module.exports = ai;
