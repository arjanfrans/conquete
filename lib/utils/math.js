'use strict';

function cartesianProduct (arr) {
    const end = arr.length - 1;
    const result = [];

    function addTo (curr, start) {
        const first = arr[start];
        const last = (start === end);

        for (let i = 0; i < first.length; i++) {
            const copy = curr.slice();

            copy.push(first[i]);

            if (last) {
                result.push(copy);
            } else {
                addTo(copy, start + 1);
            }
        }
    }

    if (arr.length) {
        addTo([], 0);
    } else {
        result.push([]);
    }

    return result;
}

module.exports = { cartesianProduct };
