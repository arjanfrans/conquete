'use strict';

function cartesianProduct (arr) {
    let end = arr.length - 1;
    let result = [];

    function addTo(curr, start) {
        let first = arr[start];
        let last = (start === end);

        for (let i = 0; i < first.length; ++i) {
            let copy = curr.slice();

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
