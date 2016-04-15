'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');
const stateBattle = require('../states/battle');
const Dice = require('../../lib/risk/utils/dice');
const sinon = require('sinon');

describe('battle phase', function () {
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

    const game = risk.Game(gameListener, options, stateBattle);

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
        let currentBattleTurn = null;

        diceStub = sinon.stub(Dice, 'roll', function(numberOfDice) {
            return [1, 1, 1];
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

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
            playerEvents.REQUIRE_ATTACK_ACTION.push(data);

            const player = game.getPlayer(data.playerId);

            while (!fromTerritory) {
                const territory = game.board.getTerritory(player.territoryIds[0]);
                const enemyAdjacent = game.board.getAdjacentTerritories(territory.id, false);

                if (enemyAdjacent.length > 0 && territory.units > 1) {
                    fromTerritory = territory;
                    toTerritory = enemyAdjacent[0];
                }
            }

            game.act.attack(data.playerId, fromTerritory.id, toTerritory.id, fromTerritory.units - 1);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
            playerEvents.REQUIRE_DICE_ROLL.push(data);

            if (!currentBattleTurn) {
                game.act.rollDice(data.playerId, data.maxDice);
                currentBattleTurn = data.playerId;
            }

        });

        game.start();
    });

    it('GAME_START and previous emitted game event is emitted', function () {
        expect(gameEvents.GAME_START).to.have.length(1);
        expect(gameEvents.GAME_START[0]).to.have.property('message');
        expect(gameEvents.TURN_CHANGE).to.have.length(1);
        expect(gameEvents.TURN_CHANGE[0]).to.have.property('playerId',
            stateBattle.previousTurnEvent.data.playerId);
    });

    it('REQUIRE_ATTACK_ACTION is emitted', function () {
        expect(playerEvents.REQUIRE_ATTACK_ACTION).to.have.length(1);
        expect(playerEvents.REQUIRE_ATTACK_ACTION[0]).to.have.property('playerId',
            stateBattle.previousTurnEvent.data.playerId);
        expect(playerEvents.REQUIRE_ATTACK_ACTION[0].message).to.match(/^You are in the attack phase/);
    });

    it('fromTerritory and toTerritory are correct', function () {
        expect(fromTerritory.owner).to.equal(stateBattle.previousTurnEvent.data.playerId);
        expect(fromTerritory.units).to.be.above(1);
        expect(toTerritory.owner).to.not.equal(stateBattle.previousTurnEvent.data.playerId);
    });

    it('an attack is initiated', function () {
        expect(gameEvents.ATTACK).to.have.length(1);
        expect(playerEvents.REQUIRE_DICE_ROLL).to.have.length(1);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].maxDice).to.equal(Math.min(fromTerritory.units - 1, 3));
        expect(playerEvents.REQUIRE_DICE_ROLL[0].type).to.equal('attacker');
        expect(playerEvents.REQUIRE_DICE_ROLL[0].playerId).to.equal(stateBattle.previousTurnEvent.data.playerId);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].message).to.match(/^You have to roll dice. You are the attacker/);
    });

    after(function () {
        diceStub.restore();
    });
});
