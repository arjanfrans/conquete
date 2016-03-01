'use strict';

const Queue = require('./Queue');

class RotatingQueue extends Queue {
    constructor (items) {
        super(items);
    }

    remove (item) {
        let index = this.items.indexOf(item);

        if (index === -1) {
            throw new Error('Item does not exist');
        }

        this.items.splice(index, 1);
    }

    next () {
        let item = this.items.shift();

        this.items.push(item);

        return item;
    }
}

module.exports = RotatingQueue;
