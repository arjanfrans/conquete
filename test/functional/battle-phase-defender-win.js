'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib');
const stateBattle = require('../states/battle');
const Dice = require('../../lib/utils/dice');
const sinon = require('sinon');

describe('battle phase defender wins', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();

    const options = {
        listener: gameListener,
        players: [
            {
                id: '1',
                listener: playerListener
            },
            {
                id: '2',
                listener: playerListener
            }, {
                id: '3',
                listener: playerListener
            }
        ]
    };

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    let fromTerritory = null;
    let toTerritory = null;
    let diceStub = null;

    before(function () {
        const game = risk.Game(options, stateBattle);

        let currentBattleType = null;

        // Let the defender always win
        diceStub = sinon.stub(Dice, 'roll', function (numberOfDice) {
            const result = [];

            if (currentBattleType === 'attacker') {
                for (let i = 0; i < numberOfDice; i++) {
                    result.push(1);
                }
            } else {
                for (let i = 0; i < numberOfDice; i++) {
                    result.push(6);
                }
            }

            return result;
        });

        gameListener.on(risk.GAME_EVENTS.ATTACK, data => {
            gameEvents.ATTACK.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.ATTACK_DICE_ROLL, data => {
            gameEvents.ATTACK_DICE_ROLL.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.DEFEND_DICE_ROLL, data => {
            gameEvents.DEFEND_DICE_ROLL.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.BATTLE_END, data => {
            gameEvents.BATTLE_END.push(data);
        });

        let firstBattle = null;

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
            playerEvents.REQUIRE_ATTACK_ACTION.push(data);

            if (!firstBattle) {
                firstBattle = true;

                const player = game.getPlayer(data.playerId);

                while (!fromTerritory) {
                    const territory = game.board.getTerritory(player.territoryIds[0]);
                    const enemyAdjacent = game.board.getAdjacentTerritories(territory.id, false);

                    if (enemyAdjacent.length > 0 && territory.units > 1) {
                        fromTerritory = territory;
                        toTerritory = enemyAdjacent[0];
                    }
                }

                game.act.attack(data.playerId, fromTerritory.id, toTerritory.id, 3);
            } else {
                game.act.fortifyPhase(data.playerId);
            }
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
            playerEvents.REQUIRE_DICE_ROLL.push(data);

            currentBattleType = data.type;

            game.act.rollDice(data.playerId, data.maxDice);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
            playerEvents.REQUIRE_FORTIFY_ACTION.push(data);
        });

        game.start();
    });

    it('an attack is initiated and REQUIRE_DICE_ROLL is emitted', function () {
        expect(gameEvents.ATTACK).to.have.length(1);
        expect(playerEvents.REQUIRE_DICE_ROLL).to.have.length(6);

        let currentPlayer = fromTerritory.owner;
        let attackUnits = 3;

        for (const requireDiceRoll of playerEvents.REQUIRE_DICE_ROLL) {
            if (currentPlayer === fromTerritory.owner) {
                expect(requireDiceRoll.maxDice).to.equal(attackUnits);
                expect(requireDiceRoll.type).to.equal('attacker');
                expect(requireDiceRoll.playerId).to.equal(stateBattle.previousTurnEvent.data.playerId);
                expect(requireDiceRoll.message).to.match(/^You have to roll dice. You are the attacker/);

                attackUnits -= 1;
                currentPlayer = toTerritory.owner;
            } else {
                expect(requireDiceRoll.maxDice).to.equal(1);
                expect(requireDiceRoll.type).to.equal('defender');
                expect(requireDiceRoll.playerId).to.equal(toTerritory.owner);
                expect(requireDiceRoll.message).to.match(/^You have to roll dice. You are the defender/);

                currentPlayer = fromTerritory.owner;
            }
        }
    });

    it('DEFEND_DICE_ROLL and ATTACK_DICE_ROLL are emitted', function () {
        expect(gameEvents.ATTACK_DICE_ROLL).to.have.length(3);
        expect(gameEvents.DEFEND_DICE_ROLL).to.have.length(3);

        const attackDice = [1, 1, 1];

        for (const attackRoll of gameEvents.ATTACK_DICE_ROLL) {
            expect(attackRoll.playerId).to.equal(fromTerritory.owner);
            expect(attackRoll.dice).to.deep.equal(attackDice);
            expect(attackRoll.message).to.match(/^Attacking dice rolled by/);

            attackDice.pop();
        }

        let attackRemaining = 3;

        for (const defendRoll of gameEvents.DEFEND_DICE_ROLL) {
            attackRemaining -= 1;

            expect(defendRoll.playerId).to.equal(toTerritory.owner);
            expect(defendRoll.dice).to.deep.equal([6]);
            expect(defendRoll.message).to.match(/^Defending dice rolled by/);
            expect(defendRoll.results).to.deep.equal({
                attackKilled: 1,
                defendKilled: 0,
                attackRemaining: attackRemaining,
                defendRemaining: 1
            });
        }
    });

    it('BATTLE_END is emitted and the defender has won', function () {
        expect(gameEvents.BATTLE_END).to.have.length(1);
        expect(gameEvents.BATTLE_END[0].type).to.equal('defender');
        expect(gameEvents.BATTLE_END[0].winner).to.equal(toTerritory.owner);
        expect(gameEvents.BATTLE_END[0].message).to.match(/^Battle has ended. Player "2"/);
    });

    after(function () {
        diceStub.restore();
    });
});
