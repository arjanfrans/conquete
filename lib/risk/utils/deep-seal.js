'use strict';

function deepseal (obj) {
    Object.seal(obj);

    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        if (obj.hasOwnProperty(prop) && obj[prop] !== null
            && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function')
            && !Object.isSealed(obj[prop])) {
            deepseal(obj[prop]);
        }
    });

    return obj;
};

module.exports = deepseal;
