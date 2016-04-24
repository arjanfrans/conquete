'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../');
const state = require('../states/kill-player');
const Dice = require('../../lib/utils/dice');
const sinon = require('sinon');

describe('battle phase kill player', function () {
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

    const game = risk.Game(options, state);

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
    const defeatedCards = [];

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
            battleData = game.battle;
            gameEvents.DEFEND_DICE_ROLL.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.BATTLE_END, data => {
            gameEvents.BATTLE_END.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.PLAYER_DEFEATED, data => {
            gameEvents.PLAYER_DEFEATED.push(data);
        });

        let firstBattle = null;

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
            defeatedCards.push(...game.getCards('2'));

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
        // first is from previous turn event
        expect(gameEvents.BATTLE_END).to.have.length(2);

        expect(gameEvents.BATTLE_END[1].type).to.equal('attacker');
        expect(gameEvents.BATTLE_END[1].winner).to.equal(state.turn.player);
        expect(gameEvents.BATTLE_END[1].message).to.match(/^Battle has ended. Player "1", the attacker, has won/);
    });

    it('battle data at end of battle is correct', function () {
        expect(battleData).to.deep.equal({
            from: 'western_united_states',
            to: 'central_america',
            players: ['1', '2'],
            attacker: { player: '1', initialUnits: 7, units: 7, dice: [] },
            defender: { player: '2', initialUnits: 1, units: 0, dice: [] },
            turn: '2',
            winner: '1'
        });
    });

    it('PLAYER_DEFEATED is emitted', function () {
        expect(gameEvents.PLAYER_DEFEATED).to.have.length(1);
        expect(gameEvents.PLAYER_DEFEATED[0].defeatedBy).to.equal(state.turn.player);
        expect(gameEvents.PLAYER_DEFEATED[0].numberOfCardsTaken).to.equal(defeatedCards.length);
        expect(gameEvents.PLAYER_DEFEATED[0].playerId).to.equal('2');
        expect(gameEvents.PLAYER_DEFEATED[0].message).to.match(/^Player "2" is defeated by player "1"/);
    });

    it('REQUIRE_FORTIFY_ACTION and TURN_PHASE_CHANGE is emitted on foritfy', function () {
        expect(gameEvents.TURN_PHASE_CHANGE).to.have.length(1);
        expect(gameEvents.TURN_PHASE_CHANGE[0].playerId).to.equal(state.turn.player);
        expect(gameEvents.TURN_PHASE_CHANGE[0].phase).to.equal('fortifying');
        expect(gameEvents.TURN_PHASE_CHANGE[0].message).to.match(/^The turn phase has changed to "fortifying"/);

        expect(playerEvents.REQUIRE_FORTIFY_ACTION).to.have.length(1);
        expect(playerEvents.REQUIRE_FORTIFY_ACTION[0].playerId).to.equal(state.turn.player);
        expect(playerEvents.REQUIRE_FORTIFY_ACTION[0].message).to.match(/^You are in the foritfy/);
    });

    it('NEW_CARD is emitted for each of the defeated player\'s cards', function () {
        // +1 for conquest in turn
        expect(playerEvents.NEW_CARD).to.have.length(defeatedCards.length + 1);

        for (let i = 0; i < defeatedCards.length; i++) {
            expect(playerEvents.NEW_CARD[i].card).to.equal(defeatedCards[i]);
        }
    });

    after(function () {
        diceStub.restore();
    });
});
