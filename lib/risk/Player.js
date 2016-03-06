'use strict';

class Player {
    constructor (id, name, color) {
        this.id = id;
        this.name = name;
        this.startUnits = 0;
        this.cards = new Set();
        this.dead = false;
        this.territories = new Set();
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

    toJSON (options) {
        options = options || {};

        let json = {
            id: this.id,
            name: this.name,
            dead: this.dead,
            startUnits: this.startUnits,
            territoryIds: Array.from(this.territories).map(territory => territory.id),
            cards: Array.from(this.cards)
        };

        if (options.hide) {
            for (let hide of options.hide) {
                delete json[hide];
            }
        }

        return json;
    }

}

module.exports = Player;
