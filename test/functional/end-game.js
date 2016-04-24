'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../');
const state = require('../states/end-game');
const Dice = require('../../lib/utils/dice');
const sinon = require('sinon');

describe('end the game', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();

    const options = {
        debug: true,
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

    const game = risk.Game(options, state);

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    let diceStub = null;
    const cardData = [];
    let gameEndActionError = null;
    let isGameOverBefore = null;

    before(function () {
        let currentBattleType = null;

        // Let the attacker always win
        diceStub = sinon.stub(Dice, 'roll', function (numberOfDice) {
            const result = [];

            if (currentBattleType === 'attacker') {
                for (let i = 0; i < numberOfDice; i++) {
                    result.push(6);
                }
            } else {
                for (let i = 0; i < numberOfDice; i++) {
                    result.push(1);
                }
            }

            return result;
        });

        gameListener.on(risk.GAME_EVENTS.GAME_START, data => {
            gameEvents.GAME_START.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_CHANGE, data => {
            gameEvents.TURN_CHANGE.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_PHASE_CHANGE, data => {
            gameEvents.TURN_PHASE_CHANGE.push(data);
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

        gameListener.on(risk.GAME_EVENTS.GAME_END, data => {
            gameEvents.GAME_END.push(data);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
            playerEvents.REQUIRE_ATTACK_ACTION.push(data);

            game.act.attack(data.playerId, 'india', 'china', 10);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
            playerEvents.REQUIRE_DICE_ROLL.push(data);

            currentBattleType = data.type;

            isGameOverBefore = game.isGameOver();

            game.act.rollDice(data.playerId, data.maxDice);

            if (game.isGameOver()) {
                try {
                    game.act.fortifyPhase(data.playerId);
                } catch (err) {
                    gameEndActionError = err;
                }
            }
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
            playerEvents.REQUIRE_FORTIFY_ACTION.push(data);
        });

        playerListener.on(risk.PLAYER_EVENTS.NEW_CARD, data => {
            playerEvents.NEW_CARD.push(data);
            cardData.push({ playerId: data.playerId, cards: game.getCards(data.playerId) });
        });

        game.start();
    });

    it('GAME_START and previous emitted game event is emitted', function () {
        expect(gameEvents.GAME_START).to.have.length(1);
        expect(gameEvents.GAME_START[0]).to.have.property('message');
        expect(gameEvents.TURN_CHANGE).to.have.length(1);
        expect(gameEvents.TURN_CHANGE[0].playerId).to.equal(state.turn.player);
    });

    it('an attack is initiated and REQUIRE_DICE_ROLL is emitted', function () {
        expect(gameEvents.ATTACK).to.have.length(1);
        expect(playerEvents.REQUIRE_DICE_ROLL).to.have.length(2);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].maxDice).to.equal(Math.min(state.turn.battle.attacker.units, 3));
        expect(playerEvents.REQUIRE_DICE_ROLL[0].type).to.equal('attacker');
        expect(playerEvents.REQUIRE_DICE_ROLL[0].playerId).to.equal(state.turn.battle.attacker.player);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].message).to.match(/^You have to roll dice. You are the attacker/);

        expect(playerEvents.REQUIRE_DICE_ROLL[1].maxDice).to.equal(1);
        expect(playerEvents.REQUIRE_DICE_ROLL[1].type).to.equal('defender');
        expect(playerEvents.REQUIRE_DICE_ROLL[1].playerId).to.equal(state.turn.battle.defender.player);
        expect(playerEvents.REQUIRE_DICE_ROLL[1].message).to.match(/^You have to roll dice. You are the defender/);
    });

    it('DEFEND_DICE_ROLL and ATTACK_DICE_ROLL are emitted', function () {
        expect(gameEvents.ATTACK_DICE_ROLL).to.have.length(1);
        expect(gameEvents.DEFEND_DICE_ROLL).to.have.length(1);
        expect(gameEvents.ATTACK_DICE_ROLL[0].playerId).to.equal(state.turn.battle.attacker.player);
        expect(gameEvents.ATTACK_DICE_ROLL[0].dice).to.deep.equal([6, 6, 6]);
        expect(gameEvents.ATTACK_DICE_ROLL[0].message).to.match(/^Attacking dice rolled by/);

        expect(gameEvents.DEFEND_DICE_ROLL[0].playerId).to.equal(state.turn.battle.defender.player);
        expect(gameEvents.DEFEND_DICE_ROLL[0].dice).to.deep.equal([1]);
        expect(gameEvents.DEFEND_DICE_ROLL[0].message).to.match(/^Defending dice rolled by/);
        expect(gameEvents.DEFEND_DICE_ROLL[0].results).to.deep.equal({
            attackRemaining: 37,
            defendRemaining: 0,
            attackKilled: 0,
            defendKilled: 1
        });
    });

    it('BATTLE_END is emitted and the attacker has won', function () {
        expect(gameEvents.BATTLE_END).to.have.length(1);
        expect(gameEvents.BATTLE_END[0].type).to.equal('attacker');
        expect(gameEvents.BATTLE_END[0].winner).to.equal(state.turn.player);
        expect(gameEvents.BATTLE_END[0].message).to.match(/^Battle has ended. Player "\d"/);
    });

    it('GAME_END is emitted when last player is defeated', function () {
        expect(isGameOverBefore).to.equal(false);
        expect(game.isGameOver()).to.equal(true);

        expect(gameEvents.GAME_END).to.have.length(1);
        expect(gameEvents.GAME_END[0].winner).to.equal(state.turn.battle.attacker.player);
        expect(gameEvents.GAME_END[0].message).to.match(/^Player "1" has won the game./);
    });

    it('error is thrown when action is attempted after game ended', function () {
        expect(gameEndActionError.message).to.equal('Game has ended.');
        expect(gameEndActionError.name).to.equal('GameEndedError');
    });

    after(function () {
        diceStub.restore();
    });
});
