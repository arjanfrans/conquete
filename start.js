'use strict';

const risk = require('./lib/index');

let options = {
    mode: 'classic',
    players: [
        {
            name: 'p1',
        }
    ]
};

risk(options);
