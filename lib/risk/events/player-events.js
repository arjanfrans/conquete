'use strict';

module.exports = {
    REQUIRE_TERRITORY_CLAIM: {
        name: 'requireTerritoryClaim',
        message: data => `You must claim a territory. Available territories: ${data.territoryIds.map(id => `"${id}"`).join(', ')}.`,
        data: {
            territoryIds: 'A list of all available territories.'
        },
        required: ['territoryIds']
    },
    REQUIRE_ONE_UNIT_DEPLOY: {
        name: 'requireOneUnitDeploy',
        message: 'You must place 1 unit on one of your territories.',
        data: {
            remainingUnits: 'The number of units remaining to deploy.',
            territoryIds: 'The territories of this player.'
        },
        required: ['remainingUnits', 'territoryIds']
    },
    REQUIRE_PLACEMENT_ACTION: {
        name: 'requirePlacementAction',
        message: data => {
            let message = `You must deploy ${data.units} units on your territories.`;

            if (data.cards.length > 0) {
                message += ` You have the following cards: ${data.cards.map(card => `"${card}"`).join(', ')}.`;

                if (data.cards.length > 4) {
                    message += ' You must redeem cards until you have less than 5.';
                }
            } else {
                message += 'You have no cards.';
            }

            return message;
        },
        data: {
            units: 'The number of units you can deploy.',
            territoryIds: 'The territories of this player.',
            cards: 'Cards that you own'
        },
        required: ['units', 'territoryIds', 'cards']
    },
    REQUIRE_ATTACK_ACTION: {
        name: 'requireAttackAction',
        message: 'You are in the attack phase. Either attack or foritfy.'
    },
    REQUIRE_FORTIFY_ACTION: {
        name: 'requireForitfyAction',
        message: 'You are in the foritfy phase. Either move units or end your turn.'
    },
    REQUIRE_DICE_ROLL: {
        name: 'requireDiceRoll',
        message: data => `You have to roll dice. You are the ${data.type} and can roll a maximum of ${data.maxDice} dice.`,
        data: {
            type: 'The type of dice roll. Either "attacker" or "defender".',
            maxDice: 'The maximum number of dice.'
        },
        required: ['type', 'maxDice']
    },
    QUEUED_MOVE: {
        name: 'queuedMove',
        message: data => `You queued a move with ${data.units} units from territory "${data.from}" to "${data.to}"`,
        data: {
            from: 'The "id" of the territory to move the units from.',
            to: 'The "id" of the territory to move the units to.',
            units: 'The number of units to move.'
        },
        required: ['from', 'to', 'units']
    },
    NEW_CARD: {
        name: 'newCard',
        message: data => `You received a new card: "${data.card}".`,
        data: {
            card: 'THe received card.'
        },
        required: ['card']
    },

};
