'use strict';

const risk = require('./lib/index');

let state = {
    phase: 'setupA',
    turn: {},
    cards: [
        'cavalry_afganistan',
        'artillery_siam',
        'infantry_peru',
        'cavalry_china'
    ],
    players: [
        {
            id: 0,
            name: 'p1',
            startUnits: 35,
            dead: false,
            cards: []
        }
    ],
    board: require('./maps/classic')
};

let options = {
    mode: 'classic',
    map: 'classic',
    startUnits: {
        '2': 40,
        '3': 35,
        '4': 30,
        '5', 25,
        '6', 20
    },
    players: [
        {
            name: 'p1',
        }
    ],
    jokerCards: 2,
    cardBonus: [
        {
            cards: ['cavalry', 'artillery', 'infantry'],
            bonus: 10
        },
        {
            cards: ['artillery', 'artillery',' artillery'],
            bonus: 8,
        },
        {
            cards: ['cavalry', 'cavalry',' cavalry'],
            bonus: 6,
        },
        {
            cards: ['infantry', 'infantry',' infantry'],
            bonus: 4,
        }
    ]
};

risk(options);
