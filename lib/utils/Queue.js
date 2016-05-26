'use strict';

function Queue ({ items }) {
    items = items ? items.slice() : [];

    function push (item) {
        items.push(item);
    }

    function pop () {
        return items.shift();
    }

    function shuffle () {
        let counter = items.length;

        while (counter > 0) {
            const index = Math.floor(Math.random() * counter);

            counter -= 1;

            const temp = items[counter];

            items[counter] = items[index];
            items[index] = temp;
        }
    }

    function getItems () {
        return items.slice(0);
    }

    function remove (item) {
        const index = items.indexOf(item);

        if (index === -1) {
            throw new Error('Item does not exist');
        }

        items.splice(index, 1);
    }

    return Object.freeze({
        push,
        pop,
        shuffle,
        getItems,
        remove
    });
}

module.exports = { create: Queue };
