'use strict';

const debug = require('debug')('risk:territory-cards');

const BONUSES = {
    'infantry': 4,
    'cavalry': 6,
    'artillery': 8,
    'mixed': 10
};

const Queue = require('./Queue');
const Card = require('./Card');

module.exports = function (options) {
    options.bonuses = options.bonuses || BONUSES;

    let cardBonus = cards => {
        let first = cards[0];
        let equalType = first.type;
        let allCardsEqual = cards.every(card => {
            if (card.type === 'joker') {
                return true;
            }

            equalType = card.type;

            return card.type === first.type;
        });

        if (allCardsEqual) {
            return options.bonuses[equalType];
        }

        let diffCards = [];

        for (let card of cards) {
            if (diffCards.indexOf(card.type) === -1) {
                diffCards.push(card);
            }
        }

        if (diffCards.length === 3) {
            return options.bonuses['mixed'];
        }

        throw new Error('Invalid cards combination');
    }

    return {
        createDeck (territoryIds) {
            let deck = new Queue();

            for (let type of Card.TYPES) {
                if (type === 'joker') {
                    let joker0 = new Card('joker_0', 'joker');
                    let joker1 = new Card('joker_1', 'joker');

                    deck.push(joker0);
                    deck.push(joker1);

                    cards.set(joker0.id, joker0);
                    cards.set(joker1.id, joker1);
                } else {
                    for (let i = 0; i < 14; i++) {
                        let territoryId = territoryIds.shift();
                        let id = type + '_' + territoryId;
                        let card = new Card(id, type, territoryId);

                        deck.push(card);
                        cards.set(card.id, card);
                    }
                }
            }

            deck.shuffle();

            debug('card deck created', deck.toString());

            return deck;
        },

        cardBonus: cardBonus,

        isValidCombination (cards) {
            try {
                cardBonus(cards);

                return true;
            } catch (e) {
                return false;
            }
        }
    };
}
