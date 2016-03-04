function getCombinations(array, start, initialStuff, output) {
    start = start || 0;
    initialStuff = initialStuff || [];
    output = output || [];

    if (initialStuff.length >= 3) {
        output.push(initialStuff);
    } else {
        var i;

        for (i = start; i < array.length; ++i) {
            getCombinations(array, i + 1, initialStuff.concat(array[i]), output);
        }
    }

    return output;
}

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    randomValue: randomValue,
    getCombinations: getCombinations
};
