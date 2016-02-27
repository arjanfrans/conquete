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
}

module.exports = Continent;
