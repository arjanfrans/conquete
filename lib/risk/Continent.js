'use strict';

class Continent {
    constructor (id, name, bonus) {
        this.id = id;
        this.territories = new Set();
        this.bonus = bonus;
    }

    addTerritory (territory) {
        this.territories.add(territory);
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
}

module.exports = Continent;
