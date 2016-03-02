'use strict';

class Player {
    constructor (id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.startUnits = 0;
        this.territories = new Set();
        this.cards = new Set();
    }

    toString () {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            color: this.color
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
