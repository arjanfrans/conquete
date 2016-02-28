'use strict';

const TYPES = [
    'joker',
    'infantry',
    'cavalry',
    'artillery'
];

class Card {
    constructor (id, type, territory) {
        this.id = id;
        this.territory = territory || null;
        this.type = type;
    }

    static get TYPES () {
        return TYPES;
    }

    toString () {
        return this.id;
    }

}

module.exports = Card;
