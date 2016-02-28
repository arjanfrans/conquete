'use strict';

const TYPES = [
    'joker',
    'infantry',
    'cavalry',
    'artillery'
];

class Card {
    constructor (type, territory) {
        this.territory = territory || null;
        this.type = type;
    }

    static get TYPES () {
        return TYPES;
    }

}

module.exports = Card;
