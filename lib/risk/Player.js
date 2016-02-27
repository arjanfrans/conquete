'use strict';

class Player {
    constructor (id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.startUnits = 0;
        this.territories = new Set();
        this.continents = new Set();
    }

    toString () {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            color: this.color
        });
    }
}

module.exports = Player;
