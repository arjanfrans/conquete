'use strict';

class RotatingQueue {
    constructor (items) {
        this.items = items;
        this.shuffle();
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

    shuffle () {
        let counter = this.items.length;

        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);

            counter -= 1;

            let temp = this.items[counter];

            this.items[counter] = this.items[index];
            this.items[index] = temp;
        }
    }


}

module.exports = RotatingQueue;
