'use strict';

class Player {
    constructor (id) {
        this.id = id;
        this.startUnits = 0;
        this.cards = new Set();
        this.territories = new Set();
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

    isDead () {
        return this.territories.size === 0 && this.startUnits === 0;
    }

    toJSON (options) {
        options = options || {};

        const json = {
            id: this.id,
            dead: this.dead,
            startUnits: this.startUnits,
            territoryIds: Array.from(this.territories).map(territory => territory.id),
            cards: Array.from(this.cards),
            cardsCount: this.cards.size
        };

        if (options.hide) {
            for (const hide of options.hide) {
                delete json[hide];
            }
        }

        return json;
    }

}

module.exports = Player;
