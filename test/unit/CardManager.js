'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const CardManager = require('../../lib/CardManager');

const CARDS = [
    'joker_0',
    'joker_1',
    'infantry_south_africa',
    'cavalry_congo',
    'artillery_east_africa',
    'infantry_egypt',
    'cavalry_madagascar',
    'artillery_north_africa',
    'infantry_afganistan',
    'cavalry_china',
    'artillery_india',
    'infantry_irkutsk',
    'cavalry_japan',
    'artillery_kamchatka',
    'infantry_middle_east',
    'cavalry_mongolia',
    'artillery_siam',
    'infantry_siberia',
    'cavalry_eastern_australia',
    'artillery_indonesia',
    'infantry_new_guinea',
    'cavalry_western_australia',
    'artillery_great_britain',
    'infantry_iceland',
    'cavalry_northern_europe',
    'artillery_scandinavia',
    'infantry_southern_europe',
    'cavalry_ukraine',
    'artillery_western_europe',
    'infantry_alaska',
    'cavalry_alberta',
    'artillery_central_america',
    'infantry_eastern_united_states',
    'cavalry_greenland',
    'artillery_northwest_territory',
    'infantry_ontario',
    'cavalry_quebec',
    'artillery_western_united_states',
    'infantry_argentina',
    'cavalry_brazil',
    'artillery_peru',
    'infantry_venezuela',
    'cavalry_ural',
    'artillery_yakutsk'
];

describe('CardManager', function () {
    it('correct bonuses', function () {
        const manager = CardManager.create({
            cards: CARDS,
            cardTypes: ['cavalry', 'artillery', 'infantry'],
            jokerCard: 'joker',
            bonusOptions: [
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
        });

        const combos = [
            {
                cards: ['cavalry_a', 'cavalry_b', 'cavalry_c'],
                bonus: 6
            }
        ];

        for (const combo of combos) {
            expect(manager.getBonus(combo.cards)).to.equal(combo.bonus);
        }
    });
});
