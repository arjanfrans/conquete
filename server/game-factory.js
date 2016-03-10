'use strict';

const gameFactory = {
    classic () {
        const options = {
            mode: 'classic',
            map: 'classic',
            startUnits: {
                '2': 40,
                '3': 35,
                '4': 30,
                '5': 25,
                '6': 20
            },
            jokerCards: 2,
            cardBonus: [
                {
                    cards: ['cavalry', 'artillery', 'infantry'],
                    bonus: 10
                },
                {
                    cards: ['artillery', 'artillery', 'artillery'],
                    bonus: 8,
                },
                {
                    cards: ['cavalry', 'cavalry', 'cavalry'],
                    bonus: 6,
                },
                {
                    cards: ['infantry', 'infantry', 'infantry'],
                    bonus: 4,
                }
            ]
        };

        return options;
    }
};

module.exports = gameFactory;
