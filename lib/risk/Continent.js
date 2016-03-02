'use strict';

class Continent {
    constructor (id, name, bonus) {
        this.id = id;
        this.name = name;
        this.territories = new Set();
        this.bonus = bonus;
    }

    addTerritory (territory) {
        this.territories.add(territory);
    }

    get adjacentContinents () {
        let continents = [];

        for (let territory of this.territories) {
            let adjacentTerritories = territory.adjacentTerritories;

            for (let adjacentTerritory of adjacentTerritories.values()) {
                if (adjacentTerritory.continent !== null && adjacentTerritory.continent !== this) {
                    if (!continents.includes(adjacentTerritory.continent)) {
                        continents.push(adjacentTerritory.continent);
                    }
                }
            }
        }

        return continents;
    }

    get occupyingPlayer () {
        let occupyingPlayer = null;

        this.territories.forEach((territory, index) => {
            if (territory.isOccupied()) {
                if (index === 0) {
                    occupyingPlayer = territory.player;
                } else if(occupyingPlayer !== territory.player) {
                    return null;
                }
            } else {
                return null;
            }
        });

        return occupyingPlayer;
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            owner: this.occupyingPlayer ? this.occupyingPlayer.id : null,
            territories: Array.from(this.territories.values()).map(territory => {
                return territory.id;
            }),
            adjacentContinents: this.adjacentContinents.map(continent => {
                return continent.id;
            })
        };
    }
}

module.exports = Continent;
