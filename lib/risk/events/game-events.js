'use strict';

module.exports = {
    GAME_START: {
        name: 'gameStart',
        message: 'The game has started.'
    },
    TURN_CHANGE: {
        name: 'turnChange',
        message: data => `The turn has changed to player "${data.playerId}".`,
        data: {
            playerId: 'The "id" of the player the turn has changed to.'
        },
        required: ['playerId']
    },
    PHASE_CHANGE: {
        name: 'phaseChange',
        message: data => `The game phase has changed to "${data.phase}". Turn is to player "${data.playerId}".`,
        data: {
            playerId: 'The "id" of the player that is to turn.',
            phase: 'The phase the game has changed to.'
        },
        required: ['phase']
    },
    TURN_PHASE_CHANGE: {
        name: 'turnPhaseChange',
        message: data => `The turn phase has changed to "${data.phase}". Turn is to player "${data.playerId}".`,
        data: {
            playerId: 'The "id" of the player that is to turn.',
            phase: 'The turn phase the game has changed to.'
        },
        required: ['playerId', 'phase']
    },
    TERRITORY_CLAIMED: {
        name: 'territoryClaimed',
        message: data => `Territory "${data.territoryId}" has been claimed by player "${data.playerId}".`,
        data: {
            playerId: 'The "id" of the player that claimed the territory.',
            territoryId: 'The "id" of the claimed territory.',
            units: 'The number of units placed on the territory.'
        },
        required: ['playerId', 'territoryId', 'units']
    },
    DEPLOY_UNITS: {
        name: 'deployUnits',
        message: data => `Player "${data.playerId}" deployed ${data.units} units on territory "${data.territoryId}".`,
        data: {
            playerId: 'The "id" of the player that has deployed units to the territory.',
            territoryId: 'The "id" of the territory units are deployed on.',
            units: 'The number of units deployed on the territory.'
        },
        required: ['playerId', 'territoryId', 'units']
    },
    ATTACK: {
        name: 'attack',
        message: data => `Attack initiated by player "${data.attacker}" with ${data.units} units. From territory "${data.from}" to "${data.to}", owned by player "${data.defender}".`,
        data: {
            from: 'The "id" of the territory the attack is coming from.',
            to: 'The "id" of the territory that is under attack.',
            attacker: 'The "id" of the attacking player.',
            defender: 'The "id" of the defending player.',
            units: 'The number of units the attacker is attacking with.'
        },
        required: ['from', 'to', 'attacker', 'defender', 'units']
    },
    ATTACK_DICE_ROLL: {
        name: 'attackDiceRoll',
        message: data => `Attacking dice rolled by player "${data.playerId}": ${data.dice.join(', ')}.`,
        data: {
            playerId: 'The "id" of the player that rolled the attacker dice.',
            dice: 'The resulting dice of the roll.'
        },
        required: ['playerId', 'dice']
    },
    DEFEND_DICE_ROLL: {
        name: 'defendDiceRoll',
        message: data => {
            const results = data.results;
            let message = `Defending dice rolled by player "${data.playerId}": ${data.dice.join(', ')}.`;

            if (results.attackKilled > 0) {
                message += ` ${results.attackKilled} Attacking units are killed.`;
            }

            if (results.defendKilled > 0) {
                message += ` ${results.defendKilled} Defending units are killed.`;
            }

            message += ` ${results.attackRemaining} Attacking units remaining and ${results.defendRemaining} defending units remaining.`;

            return message;
        },
        data: {
            playerId: 'The "id" of the player that rolled the defender dice.',
            dice: 'The resulting dice of the roll.',
            results: 'The results comparing both dice rolls' // TODO document object
        },
        required: ['playerId', 'dice', 'results']
    },
    BATTLE_END: {
        name: 'battleEnd',
        message: data => `Battle has ended. Player "${data.winner}", the ${data.type}, has won.`,
        data: {
            winner: 'The "id" of the winning player.',
            type: 'The "type" of winner. Either "attacker" or "defender".'
        },
        required: ['winner', 'type']
    },
    PLAYER_DEFEATED: {
        name: 'playerDefeated',
        message: data => `Player "${data.playerId}" is defeated by player "${data.defeatedBy}". Player "${data.defeatedBy}" took over ${data.numberOfCardsTaken} cards.`,
        data: {
            defeatedBy: 'The "id" of the defeating player.',
            playerId: 'The "id" of the defeated player.',
            numberOfCardsTaken: 'The number of cards the defeating player has taken from the defeated player.'
        },
        required: ['defeatedBy', 'playerId', 'numberOfCardsTaken']
    },
    REDEEM_CARDS: {
        name: 'redeemCards',
        message: data => `Player "${data.playerId}" redeemed cards ${data.cards.map(card => `"${card}"`).join(', ')} and received ${data.bonus} extra units.`,
        data: {
            playerId: 'The "id" of the player that redeemed the cards.',
            cards: 'The redeemed cards.',
            bonus: 'The bonus given to the player.'
        },
        required: ['playerId', 'cards', 'bonus']
    },
    MOVE_UNITS: {
        name: 'moveUnits',
        message: data => {
            let message = `Player "${data.playerId}" moved units: `;

            message += data.movements.map(movement => {
                return `${movement.units} units from territory "${movement.from}" to "${movement.to}"`;
            }).join(', ');

            return message;
        },
        data: {
            playerId: 'The "id" of the player that moved units',
            movements: 'A list of movements. Containing "from" and "to" territory ids and the amount of units'
        },
        required: ['playerId', 'movements']
    },
    GAME_END: {
        name: 'gameEnd',
        message: data => `Player "${data.winner} has won the game."`,
        data: {
            winner: 'The "id" of the winning player.'
        },
        required: ['winner']
    }
};
