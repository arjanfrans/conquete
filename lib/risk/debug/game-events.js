'use strict';

const constants = require('../constants');
const debug = require('debug')('risk:debug/game-events');
const GAME_EVENTS = constants.GAME_EVENTS;

function debugGameEvents (emitter) {
    emitter.on(GAME_EVENTS.GAME_START, () => {
        debug('game started');
    });

    emitter.on(GAME_EVENTS.TURN_CHANGE, data => {
        debug(`turn changed to player ${data.playerId}`);
    });

    emitter.on(GAME_EVENTS.PHASE_CHANGE, data => {
        debug(`game phase changed to ${data.phase}`);
    });

    emitter.on(GAME_EVENTS.TURN_PHASE_CHANGE, data => {
        debug(`turn phase changed to ${data.phase}`);
    });

    emitter.on(GAME_EVENTS.TERRITORY_CLAIMED, data => {
        debug(`territory ${data.territoryId} claimed by player ${data.playerId}`);
    });

    emitter.on(GAME_EVENTS.DEPLOY_UNITS, data => {
        debug(`${data.units} units deployed in territory ${data.territoryId} by player ${data.playerId}`);
    });

    emitter.on(GAME_EVENTS.ATTACK, data => {
        debug('attack initiated', data);
    });

    emitter.on(GAME_EVENTS.ATTACK_DICE_ROLL, data => {
        debug(`attacker rolled dice: ${data.dice.join(', ')}`);
    });

    emitter.on(GAME_EVENTS.REDEEM_CARDS, data => {
        debug(`player ${data.playerId} redeemed cards: ${data.cards.join(', ')} (bonus: ${data.bonus})`);
    });

    emitter.on(GAME_EVENTS.DEFEND_DICE_ROLL, data => {
        debug(`defender rolled dice: ${data.dice.join(', ')}`);

        let res = data.results;

        if (res.attackKilled > 0) {
            debug(`attacker units killed: ${res.attackKilled}`);
        }

        if (res.defendKilled > 0) {
            debug(`defender units killed: ${res.defendKilled}`);
        }

        debug(`attacker units remaining ${res.attackRemaining}, defender units remaining ${res.defendRemaining}`);
    });

    emitter.on(GAME_EVENTS.BATTLE_END, data => {
        let attack = data.type === 'attack' ? 'attacking' : 'defending';

        debug(`battle ended, ${attack} player ${data.winner} won`);
    });

    emitter.on(GAME_EVENTS.MOVE_UNITS, data => {
        for (let move of data.movements) {
            debug(`${move.units} units moved by player ${data.playerId} from ${move.from} to ${move.to}`);
        }
    });

    emitter.on(GAME_EVENTS.GAME_END, data => {
        debug(`game has ended, winner: ${data.winner}`);
    });

    return emitter;
}

module.exports = debugGameEvents;
