'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');
const state = require('../states/kill-player');
const Dice = require('../../lib/risk/utils/dice');
const sinon = require('sinon');

describe.only('battle phase kill player', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();
    const options = {
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

    const game = risk.Game(gameListener, options, state);

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const fromTerritoryId = 'western_united_states';
    const toTerritoryId = 'central_america';
    let diceStub = null;
    let battleData = null;
    const cardData = [];

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
            battleData = game.battle;
            gameEvents.ATTACK.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.ATTACK_DICE_ROLL, data => {
            gameEvents.ATTACK_DICE_ROLL.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.DEFEND_DICE_ROLL, data => {
            gameEvents.DEFEND_DICE_ROLL.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.BATTLE_END, data => {
            console.log(data.stack.stack);
            gameEvents.BATTLE_END.push(data);
        });

        let firstBattle = null;

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
            playerEvents.REQUIRE_ATTACK_ACTION.push(data);

            if (!firstBattle) {
                firstBattle = true;

                game.act.attack(data.playerId, fromTerritoryId, toTerritoryId, 7);
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
        expect(gameEvents.TURN_CHANGE[0]).to.have.property('playerId', state.turn.player);
    });

    it('REQUIRE_ATTACK_ACTION is emitted', function () {
        expect(playerEvents.REQUIRE_ATTACK_ACTION).to.have.length(2);
        expect(playerEvents.REQUIRE_ATTACK_ACTION[0]).to.have.property('playerId', state.turn.player);
        expect(playerEvents.REQUIRE_ATTACK_ACTION[0].message).to.match(/^You are in the attack phase/);
    });

    it('an attack is initiated and REQUIRE_DICE_ROLL is emitted', function () {
        expect(gameEvents.ATTACK).to.have.length(1);
        expect(playerEvents.REQUIRE_DICE_ROLL).to.have.length(2);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].maxDice).to.equal(3);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].type).to.equal('attacker');
        expect(playerEvents.REQUIRE_DICE_ROLL[0].playerId).to.equal(state.turn.player);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].message).to.match(/^You have to roll dice. You are the attacker/);

        expect(playerEvents.REQUIRE_DICE_ROLL[1].maxDice).to.equal(1);
        expect(playerEvents.REQUIRE_DICE_ROLL[1].type).to.equal('defender');
        expect(playerEvents.REQUIRE_DICE_ROLL[1].playerId).to.equal('2');
        expect(playerEvents.REQUIRE_DICE_ROLL[1].message).to.match(/^You have to roll dice. You are the defender/);
    });

    it('DEFEND_DICE_ROLL and ATTACK_DICE_ROLL are emitted', function () {
        expect(gameEvents.ATTACK_DICE_ROLL).to.have.length(1);
        expect(gameEvents.DEFEND_DICE_ROLL).to.have.length(1);
        expect(gameEvents.ATTACK_DICE_ROLL[0].playerId).to.equal(state.turn.player);
        expect(gameEvents.ATTACK_DICE_ROLL[0].dice).to.deep.equal([6, 6, 6]);
        expect(gameEvents.ATTACK_DICE_ROLL[0].message).to.match(/^Attacking dice rolled by/);

        expect(gameEvents.DEFEND_DICE_ROLL[0].playerId).to.equal('2');
        expect(gameEvents.DEFEND_DICE_ROLL[0].dice).to.deep.equal([1]);
        expect(gameEvents.DEFEND_DICE_ROLL[0].message).to.match(/^Defending dice rolled by/);
        expect(gameEvents.DEFEND_DICE_ROLL[0].results).to.deep.equal({
            attackKilled: 0,
            defendKilled: 1,
            attackRemaining: 7,
            defendRemaining: 0
        });
    });

    it('BATTLE_END is emitted and the attacker has won', function () {
        console.log(gameEvents.BATTLE_END)
        expect(gameEvents.BATTLE_END).to.have.length(1);
        expect(gameEvents.BATTLE_END[0].type).to.equal('attacker');
        expect(gameEvents.BATTLE_END[0].winner).to.equal(state.turn.player);
        expect(gameEvents.BATTLE_END[0].message).to.match(/^Battle has ended. Player "2"/);
    });

    it('REQUIRE_FORTIFY_ACTION and TURN_PHASE_CHANGE is emitted on foritfy', function () {
        expect(gameEvents.TURN_PHASE_CHANGE).to.have.length(2);
        expect(gameEvents.TURN_PHASE_CHANGE[1].playerId).to.equal(fromTerritory.owner);
        expect(gameEvents.TURN_PHASE_CHANGE[1].phase).to.equal('fortifying');
        expect(gameEvents.TURN_PHASE_CHANGE[1].message).to.match(/^The turn phase has changed to "fortifying"/);

        expect(playerEvents.REQUIRE_FORTIFY_ACTION).to.have.length(1);
        expect(playerEvents.REQUIRE_FORTIFY_ACTION[0].playerId).to.equal(fromTerritory.owner);
        expect(playerEvents.REQUIRE_FORTIFY_ACTION[0].message).to.match(/^You are in the foritfy/);
    });

    it('NEW_CARD is emitted to player, player received card', function () {
        expect(playerEvents.NEW_CARD).to.have.length(1);
        expect(playerEvents.NEW_CARD[0].card).to.equal(state.cardQueue[0]);
        expect(cardData).to.have.length(1);
        expect(cardData[0].playerId).to.equal(fromTerritory.owner);
        expect(cardData[0].cards).to.have.length(1);
        expect(cardData[0].cards).to.deep.equal([playerEvents.NEW_CARD[0].card]);
    });

    after(function () {
        diceStub.restore();
    });
});
