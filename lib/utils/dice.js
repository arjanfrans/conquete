'use strict';

function roll (numberOfDice) {
    const results = [];

    for (let i = 0; i < numberOfDice; i++) {
        const result = Math.floor(Math.random() * 6) + 1;

        results.push(result);
    }

    return results.sort((a, b) => {
        return b - a;
    });
}

module.exports = { roll };
