'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib');
const state = require('../states/resume-battle');

describe('load state saved in a battle', function () {
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

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    let battle = null;

    before(function () {
        const game = risk.Game(options, state);

        gameListener.on(risk.GAME_EVENTS.GAME_START, data => {
            gameEvents.GAME_START.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_CHANGE, data => {
            gameEvents.TURN_CHANGE.push(data);
        });

        gameListener.on(risk.GAME_EVENTS.TURN_PHASE_CHANGE, data => {
            gameEvents.TURN_PHASE_CHANGE.push(data);
        });

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
            if (!battle) {
                battle = game.battle;
            }

            playerEvents.REQUIRE_DICE_ROLL.push(data);
        });

        game.start();
    });

    it('GAME_START and previous emitted game event is emitted', function () {
        expect(gameEvents.GAME_START).to.have.length(1);
        expect(gameEvents.GAME_START[0]).to.have.property('message');
        expect(gameEvents.TURN_CHANGE).to.have.length(1);
        expect(gameEvents.TURN_CHANGE[0]).to.have.property('playerId',
            state.turn.battle.attacker.player);
    });

    it('battle object is returned', function () {
        expect(battle).to.deep.equal({
            from: state.turn.battle.from,
            to: state.turn.battle.to,
            players: state.turn.battle.players,
            attacker: state.turn.battle.attacker,
            defender: state.turn.battle.defender,
            turn: state.turn.battle.turn,
            winner: null
        });
    });

    it('an attack is initiated and REQUIRE_DICE_ROLL is emitted', function () {
        expect(playerEvents.REQUIRE_DICE_ROLL).to.have.length(1);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].maxDice).to.equal(Math.min(3, state.turn.battle.attacker.units));
        expect(playerEvents.REQUIRE_DICE_ROLL[0].type).to.equal('attacker');
        expect(playerEvents.REQUIRE_DICE_ROLL[0].playerId).to.equal(state.turn.battle.attacker.player);
        expect(playerEvents.REQUIRE_DICE_ROLL[0].message).to.match(/^You have to roll dice. You are the attacker/);
    });
});
