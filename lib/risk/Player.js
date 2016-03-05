'use strict';

class Player {
    constructor (id, name, color) {
        this.id = id;
        this.name = name;
        this.startUnits = 0;
        this.cards = new Set();
        this.dead = false;
    }

    toString () {
        return JSON.stringify({
            id: this.id,
            name: this.name
        });
    }

    addCard (card) {
        this.cards.add(card);
    }

    removeCard (card) {
        this.cards.delete(card);
    }

    hasCards (cards) {
        return cards.every(card => {
            return this.cards.has(card);
        });
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name
        };
    }

}

module.exports = Player;
