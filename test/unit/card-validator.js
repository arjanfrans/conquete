'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const cardValidator = require('../../lib/risk/card-validator');

describe('card validator', function () {
    it('correct bonuses', function () {
        const cardBonusOptions = [
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
        ];

        const getBonus = cardValidator.getBonus;

        const combos = [
            {
                cards: ['cavalry_a', 'cavalry_b', 'cavalry_c'],
                bonus: 6
            }
        ];

        for (const combo of combos) {
            expect(getBonus(cardBonusOptions, combo.cards)).to.equal(combo.bonus);
        }
    });
});
