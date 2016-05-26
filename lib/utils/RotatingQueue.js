'use strict';

const Queue = require('./Queue');

function RotatingQueue ({ items }) {
    const queue = Queue.create({ items });

    function next () {
        const item = queue.pop();

        queue.push(item);

        return item;
    }

    return Object.freeze(Object.assign({}, queue, {
        next
    }));
}

module.exports = { create: RotatingQueue };
