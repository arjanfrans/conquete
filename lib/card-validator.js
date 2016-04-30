'use strict';

const constants = require('./constants');

const JOKER_CARD = constants.JOKER_CARD;
const CARD_TYPES = constants.CARD_TYPES;

const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

const cartesianProduct = require('./utils/math').cartesianProduct;

function findBonus (cardBonusOptions, types) {
    let highestBonus = 0;
    let highestBonusCombo = null;

    for (const bonusOption of cardBonusOptions) {
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
    const possibleTypes = Object.keys(CARD_TYPES).map(type => {
        return CARD_TYPES[type];
    });

    const positions = [];

    for (let i = 0; i < combo.length; i++) {
        if (!positions[i]) {
            positions[i] = [];
        }

        const type = combo[i];

        if (type === JOKER_CARD) {
            for (const pType of possibleTypes) {
                if (!positions[i].includes(pType)) {
                    positions[i].push(pType);
                }
            }
        } else {
            positions[i] = [type];
        }
    }

    return cartesianProduct(positions);
}

function getBonus (cardBonusOptions, cards) {
    const types = cards.map(card => card.split('_')[0]);

    let combos = [types];

    if (types.includes(JOKER_CARD)) {
        combos = findJokerCombos(types);
    }

    let highestBonus = 0;
    let highestBonusCombo = null;

    for (const combo of combos) {
        const bonusCombo = findBonus(cardBonusOptions, combo);

        if (bonusCombo && bonusCombo.bonus > highestBonus) {
            highestBonus = bonusCombo.bonus;
            highestBonusCombo = bonusCombo;
        }
    }

    if (!highestBonusCombo) {
        throw createError(ERRORS.InvalidCardsError, { cards });
    }

    return highestBonus;
}

function isValidCombo (cardBonusOptions, cards) {
    try {
        getBonus(cardBonusOptions, cards);

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = {
    getBonus: getBonus,
    isValidCombo: isValidCombo
};
