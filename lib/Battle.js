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
                to.setOwner(attacker.player, attacker.units);
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
//
// class Battle {
//     constructor (attackingTerritory, defendingTerritory, units) {
//         this.from = attackingTerritory;
//         this.to = defendingTerritory;
//
//         this.initialAttackUnits = units;
//         this.initialDefendUnits = this.to.units;
//         this.attackUnits = units;
//         this.defendUnits = this.to.units;
//
//         this.turn = this.from.owner;
//
//         this.attackDice = [];
//         this.defendDice = [];
//
//         this.attacker = this.from.owner;
//         this.defender = this.to.owner;
//
//         this.winner = null;
//     }
//
//     attackThrow (numberOfDice) {
//         if (this.turn !== this.from.owner) {
//             throw createError(ERRORS.BattleTurnError, { battleTurn: this.turn.getId() });
//         }
//
//         if (numberOfDice > 3 || numberOfDice > this.attackUnits) {
//             throw createError(ERRORS.TooManyDiceError, {
//                 maxDice: Math.min(3, this.attackUnits),
//                 dice: numberOfDice
//             });
//         }
//
//         this.attackDice = Dice.roll(numberOfDice);
//         this.turn = this.to.owner;
//
//         return this.attackDice;
//     }
//
//     defendThrow (numberOfDice) {
//         if (this.turn !== this.to.owner) {
//             throw createError(ERRORS.BattleTurnError, { battleTurn: this.turn.getId() });
//         }
//
//         if (numberOfDice > 2 || numberOfDice > this.defendUnits) {
//             throw createError(ERRORS.TooManyDiceError, {
//                 maxDice: Math.min(2, this.defendUnits),
//                 dice: numberOfDice
//             });
//         }
//
//         this.defendDice = Dice.roll(numberOfDice);
//
//         const defendDice = this.defendDice.slice();
//         const results = this._compareResult();
//
//         return {
//             dice: defendDice,
//             results: results
//         };
//     }
//
//     _compareResult () {
//         let attackKilled = 0;
//         let defendKilled = 0;
//
//         for (let i = 0; i < this.defendDice.length; i++) {
//             const defendDice = this.defendDice[i];
//             const attackDice = this.attackDice[i];
//
//             if (attackDice && defendDice) {
//                 if (defendDice >= attackDice) {
//                     attackKilled += 1;
//                 } else {
//                     defendKilled += 1;
//                 }
//             }
//         }
//
//         this.attackUnits -= attackKilled;
//         this.defendUnits -= defendKilled;
//
//         if (this.attackUnits <= 0) {
//             this.winner = this.to;
//         } else if (this.defendUnits <= 0) {
//             this.winner = this.from;
//         }
//
//         if (this.winner) {
//             this._endBattle();
//         } else {
//             this.turn = this.from.owner;
//         }
//
//         this.attackDice = [];
//         this.defendDice = [];
//
//         return {
//             attackRemaining: this.attackUnits,
//             defendRemaining: this.defendUnits,
//             attackKilled: attackKilled,
//             defendKilled: defendKilled
//         };
//     }
//
//     _endBattle () {
//         if (this.winner === this.from) {
//             this.from.removeUnits(this.initialAttackUnits);
//             this.to.setOwner(this.from.owner, this.attackUnits);
//         } else {
//             this.from.removeUnits(this.initialAttackUnits);
//         }
//     }
//
//     toJSON () {
//         return {
//             from: this.from.getId(),
//             to: this.to.getId(),
//             players: [this.attacker.getId(), this.defender.getId()],
//             attacker: {
//                 player: this.attacker.getId(),
//                 initialUnits: this.initialAttackUnits,
//                 units: this.attackUnits,
//                 dice: this.attackDice
//             },
//             defender: {
//                 player: this.defender.getId(),
//                 initialUnits: this.initialDefendUnits,
//                 units: this.defendUnits,
//                 dice: this.defendDice
//             },
//             turn: this.turn.getId(),
//             winner: this.winner ? this.winner.owner.getId() : null
//         };
//     }
// }
//
// module.exports = Battle;
