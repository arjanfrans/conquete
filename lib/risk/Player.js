'use strict';

class Player {
    constructor (id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
    }

    toString () {
        return JSON.stringify({
            id: id,
            name: name,
            color: color
        });
    }
}

module.exports = Player;
