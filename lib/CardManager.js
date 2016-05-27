'use strict';

const Queue = require('./utils/Queue');
const cartesianProduct = require('./utils/math').cartesianProduct;
const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

function CardManager ({ cards, queueCards = null, bonusOptions, cardTypes, jokerCard }) {
    const queue = Queue.create({ items: queueCards || cards });

    function findBonus (types) {
        let highestBonus = 0;
        let highestBonusCombo = null;

        for (const bonusOption of bonusOptions) {
            const bonusCombo = bonusOption.cards;
            const remainingCards = bonusCombo.slice();
            const matchingCards = [];

            for (const type of types) {
                if (remainingCards.includes(type)) {
                    matchingCards.push(type);
                    remainingCards.splice(remainingCards.indexOf(type), 1);
                }
            }

            if (matchingCards.length === 3 && types.length === 3 && bonusOption.bonus > highestBonus) {
                highestBonus = bonusOption.bonus;
                highestBonusCombo = bonusOption;
            }
        }

        return highestBonusCombo;
    }

    function findJokerCombos (combo) {
        const positions = [];

        for (let i = 0; i < combo.length; i++) {
            if (!positions[i]) {
                positions[i] = [];
            }

            const type = combo[i];

            if (type === jokerCard) {
                for (const cardType of cardTypes) {
                    if (!positions[i].includes(cardType)) {
                        positions[i].push(cardType);
                    }
                }
            } else {
                positions[i] = [type];
            }
        }

        return cartesianProduct(positions);
    }

    function getBonus (bonusCards) {
        const types = bonusCards.map(card => card.split('_')[0]);

        let combos = [types];

        if (types.includes(jokerCard)) {
            combos = findJokerCombos(types);
        }

        let highestBonus = 0;
        let highestBonusCombo = null;

        for (const combo of combos) {
            const bonusCombo = findBonus(combo);

            if (bonusCombo && bonusCombo.bonus > highestBonus) {
                highestBonus = bonusCombo.bonus;
                highestBonusCombo = bonusCombo;
            }
        }

        if (!highestBonusCombo) {
            throw createError(ERRORS.InvalidCardsError, { cards: bonusCards });
        }

        return highestBonus;
    }

    function isCardValid (card) {
        return cards.includes(card);
    }

    function isValidCombo (cards) {
        try {
            getBonus(cards);

            return true;
        } catch (err) {
            return false;
        }
    }

    function pushCard (card) {
        if (!card.includes(card)) {
            throw createError(ERRORS.InvalidCardError, { card });
        }

        queue.push(card);
    }

    function toJSON () {
        return {
            cards,
            queueCards: queue.getItems(),
            bonusOptions,
            cardTypes,
            jokerCard
        };
    }

    return Object.freeze({
        getBonus,
        isValidCombo,
        isCardValid,
        popCard: queue.pop,
        pushCard,
        shuffleCards: queue.shuffle,
        toJSON
    });
}

module.exports = { create: CardManager };
