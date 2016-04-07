'use strict';

const errors = require('./errors');

const ERRORS = errors.ERRORS;
const createError = errors.createError;

function rollDice (numberOfDice) {
    let results = [];

    for (let i = 0; i < numberOfDice; i++) {
        let result = Math.floor(Math.random() * 6) + 1;

        results.push(result);
    }

    return results.sort((a, b) => {
        return b - a;
    });
}

class Battle {
    constructor (attackingTerritory, defendingTerritory, units) {
        this.from = attackingTerritory;
        this.to = defendingTerritory;

        this.initialAttackUnits = units;
        this.initialDefendUnits = this.to.units;
        this.attackUnits = units;
        this.defendUnits = this.to.units;

        this.turn = this.from.owner;

        this.attackDice = [];
        this.defendDice = [];

        this.attacker = this.from.owner;
        this.defender = this.to.owner;

        this.winner = null;
    }

    attackThrow (numberOfDice) {
        if (this.turn !== this.from.owner) {
            throw createError(ERRORS.BattleTurnError, { battleTurn: this.turn.id });
        }

        if (numberOfDice > 3 || numberOfDice > this.attackUnits) {
            throw createError(ERRORS.TooManyDiceError, {
                maxDice: Math.min(3, this.attackUnits),
                dice: numberOfDice
            });
        }

        this.attackDice = rollDice(numberOfDice);
        this.turn = this.to.owner;

        return this.attackDice;
    }

    defendThrow (numberOfDice) {
        if (this.turn !== this.to.owner) {
            throw createError(ERRORS.BattleTurnError, { battleTurn: this.turn.id });
        }

        if (numberOfDice > 2 || numberOfDice > this.defendUnits) {
            throw createError(ERRORS.TooManyDiceError, {
                maxDice: Math.min(2, this.defendUnits),
                dice: numberOfDice
            });
        }

        this.defendDice = rollDice(numberOfDice);

        let defendDice = this.defendDice.slice();
        let results = this._compareResult();

        return {
            dice: defendDice,
            results: results
        };
    }

    _compareResult () {
        let attackKilled = 0;
        let defendKilled = 0;

        for (let i = 0; i < this.defendDice.length; i++) {
            let defendDice = this.defendDice[i];
            let attackDice = this.attackDice[i];

            if (attackDice && defendDice) {
                if (defendDice >= attackDice) {
                    attackKilled += 1;
                } else {
                    defendKilled += 1;
                }
            }
        }

        this.attackUnits -= attackKilled;
        this.defendUnits -= defendKilled;

        if (this.attackUnits <= 0) {
            this.winner = this.to;
        } else if (this.defendUnits <= 0) {
            this.winner = this.from;
        }

        if (this.winner) {
            this._endBattle();
        } else {
            this.turn = this.from.owner;
        }

        this.attackDice = [];
        this.defendDice = [];

        return {
            attackRemaining: this.attackUnits,
            defendRemaining: this.defendUnits,
            attackKilled: attackKilled,
            defendKilled: defendKilled
        };
    }

    isBattleOver () {
        return this.winner ? true : false;
    }

    _endBattle () {
        if (this.winner === this.from) {
            this.from.removeUnits(this.initialAttackUnits);
            this.to.setOwner(this.from.owner, this.attackUnits);
        } else {
            this.from.removeUnits(this.initialAttackUnits);
        }
    }

    toJSON () {
        return {
            from: this.from.id,
            to: this.to.id,
            players: [this.attacker.id, this.defender.id],
            attacker: {
                player: this.attacker.id,
                initialUnits: this.initialAttackUnits,
                units: this.attackUnits,
                dice: this.attackDice
            },
            defender: {
                player: this.defender.id,
                unitialUnits: this.initialDefendUnits,
                units: this.defendUnits,
                dice: this.defendDice
            },
            currentPlayer: this.turn.id,
            turn: this.turn.id,
            winner: this.winner ? this.winner.id : null
        };
    }
}

module.exports = Battle;
