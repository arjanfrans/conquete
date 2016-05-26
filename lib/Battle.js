'use strict';

const Dice = require('./utils/dice');
const ERRORS = require('./errors');
const createError = require('strict-errors').createError;

function Battle ({ from, to, units, turn = null }) {
    const attacker = {
        player: from.getOwner(),
        initialUnits: units,
        units: units,
        dice: []
    };
    const defender = {
        player: to.getOwner(),
        initialUnits: to.getUnits(),
        units: to.getUnits(),
        dice: []
    };

    turn = turn || attacker.player;

    function getDefendUnits () {
        return defender.units;
    }

    function getAttackUnits () {
        return attacker.units;
    }

    function getTurn () {
        return turn;
    }

    function setRemainingAttackUnits (value) {
        attacker.units = value;
    }

    function setRemainingDefendUnits (value) {
        defender.units = value;
    }

    function setAttackDice (value) {
        attacker.dice = value;
    }

    function setDefendDice (value) {
        defender.dice = value;
    }

    function getAttacker () {
        return attacker.player;
    }

    function getDefender () {
        return defender.player;
    }

    function getWinner () {
        if (attacker.units <= 0) {
            return defender.player;
        } else if (defender.units <= 0) {
            return attacker.player;
        }

        return null;
    }

    function compareResult () {
        let attackKilled = 0;
        let defendKilled = 0;

        for (let i = 0; i < defender.dice.length; i++) {
            const defendDice = defender.dice[i];
            const attackDice = attacker.dice[i];

            if (attackDice && defendDice) {
                if (defendDice >= attackDice) {
                    attackKilled += 1;
                } else {
                    defendKilled += 1;
                }
            }
        }

        attacker.units -= attackKilled;
        defender.units -= defendKilled;

        if (getWinner()) {
            if (getWinner() === attacker.player) {
                from.removeUnits(attacker.initialUnits);
                to.setOwner(attacker.player);
                to.setUnits(attacker.units);

                defender.player.removeTerritory(to);
                attacker.player.addTerritory(to);
            } else {
                from.removeUnits(attacker.initialUnits);
            }
        } else {
            turn = attacker.player;
        }

        attacker.dice = [];
        defender.dice = [];

        return {
            attackRemaining: attacker.units,
            defendRemaining: defender.units,
            attackKilled: attackKilled,
            defendKilled: defendKilled
        };
    }

    function attackThrow (numberOfDice) {
        if (turn !== attacker.player) {
            throw createError(ERRORS.BattleTurnError, { battleTurn: turn.getId() });
        }

        if (numberOfDice > 3 || numberOfDice > attacker.units) {
            throw createError(ERRORS.TooManyDiceError, {
                maxDice: Math.min(3, attacker.units),
                dice: numberOfDice
            });
        }

        attacker.dice = Dice.roll(numberOfDice);
        turn = defender.player;

        return attacker.dice.slice(0);
    }

    function defendThrow (numberOfDice) {
        if (turn !== defender.player) {
            throw createError(ERRORS.BattleTurnError, { battleTurn: turn.getId() });
        }

        if (numberOfDice > 2 || numberOfDice > defender.units) {
            throw createError(ERRORS.TooManyDiceError, {
                maxDice: Math.min(2, defender.units),
                dice: numberOfDice
            });
        }

        defender.dice = Dice.roll(numberOfDice);

        const defendDice = defender.dice.slice(0);
        const results = compareResult();

        return {
            dice: defendDice,
            results: results
        };
    }

    function hasEnded () {
        return getWinner() ? true : false;
    }

    function toJSON () {
        return {
            from: from.getId(),
            to: to.getId(),
            players: [attacker.player.getId(), defender.player.getId()],
            attacker: Object.assign({}, attacker, {
                player: attacker.player.getId()
            }),
            defender: Object.assign({}, defender, {
                player: defender.player.getId()
            }),
            turn: turn.getId(),
            winner: hasEnded() ? getWinner().getId() : null
        };
    }

    return Object.freeze({
        getTurn,
        getAttackUnits,
        getDefendUnits,
        setRemainingAttackUnits,
        setRemainingDefendUnits,
        setAttackDice,
        setDefendDice,
        attackThrow,
        defendThrow,
        hasEnded,
        getAttacker,
        getDefender,
        getWinner,
        toJSON
    });
}

module.exports = { create: Battle };
