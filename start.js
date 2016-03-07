'use strict';

const debug = require('debug')('risk:play');
const argv = require('minimist')(process.argv.slice(2));
const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface(process.stdin, process.stdout);
const Risk = require('./lib/index');
const commandParser = require('./client/command-parser');
const randomValue = require('./helper').randomValue;
const asciiMap = require('./map');
const getCombinations = require('./helper').getCombinations;
const EventEmitter = require('events');
const Simulation = require('./client/simulation');

const eventTypes = require('./lib/risk/event-types');
const EVENTS = eventTypes.EVENTS;
const PLAYER_EVENTS = eventTypes.PLAYER_EVENTS;

let map = Object.assign({}, require('./maps/classic'));

map.territories.forEach((territory, index) => {
    if (territory.id === 'india') {
        territory.owner = 0;
    }
});

let state = null;
state = JSON.parse(fs.readFileSync('./risk_state'));

let playerEvents = new EventEmitter();

let e1 = new EventEmitter();
let e2 = new EventEmitter();
e1.id = '1';
e2.id = '2';
let aiEventEmitters = {
    '1': e1,
    '2': e2
};

let options = {
    mode: 'classic',
    map: 'classic',
    startUnits: {
        '2': 40,
        '3': 35,
        '4': 30,
        '5': 25,
        '6': 20
    },
    players: [
        {
            name: 'p1',
            events: playerEvents
        },
        {
            name: 'c2',
            events: aiEventEmitters['1']
        }, {
            name: 'c3',
            events: aiEventEmitters['2']
        }
    ],
    jokerCards: 2,
    cardBonus: [
        {
            cards: ['cavalry', 'artillery', 'infantry'],
            bonus: 10
        },
        {
            cards: ['artillery', 'artillery', 'artillery'],
            bonus: 8,
        },
        {
            cards: ['cavalry', 'cavalry', 'cavalry'],
            bonus: 6,
        },
        {
            cards: ['infantry', 'infantry', 'infantry'],
            bonus: 4,
        }
    ]
};

let gameEvents = new EventEmitter();

let risk = Risk(gameEvents, options, state);
let simulation = Simulation(risk);

let playerIds = [0];
let currentPlayerId = null;

function write (...data) {
    console.log(...data);
}

gameEvents.on(EVENTS.GAME_START, () => {
    write('game started');
});

gameEvents.on(EVENTS.TURN_CHANGE, data => {
    write(`turn changed to player ${data.playerId}`);

    currentPlayerId = data.playerId;

    if (playerIds.includes(data.playerId)) {
        rl.prompt();
    } else {
        simulation.aiAction();
    }
});

gameEvents.on(EVENTS.PHASE_CHANGE, data => {
    write(`game phase changed to ${data.phase}`);
});

gameEvents.on(EVENTS.TURN_PHASE_CHANGE, data => {
    write(`turn phase changed to ${data.phase}`);
});

gameEvents.on(EVENTS.TERRITORY_CLAIMED, data => {
    write(`territory ${data.territoryId} claimed by player ${data.playerId}`);
});

gameEvents.on(EVENTS.DEPLOY_UNITS, data => {
    write(`${data.units} units deployed in territory ${data.territoryId} by player ${data.playerId}`);
});

gameEvents.on(EVENTS.ATTACK, data => {
    write('attack initiated', data);

    if (playerIds.includes(data.attacker)) {
        currentPlayerId = data.attacker;
        rl.prompt();
    }
});

gameEvents.on(EVENTS.ATTACK_DICE_ROLL, data => {
    write(`attacker rolled dice: ${data.dice.join(', ')}`);
});

gameEvents.on(EVENTS.DEFEND_DICE_ROLL, data => {
    write(`defender rolled dice: ${data.dice.join(', ')}`);
});

gameEvents.on(EVENTS.BATTLE_END, data => {
    write(`battle ended, player ${data.winner} won`);
});

rl.on('line', line => {
    try {
        let output = commandParser(risk, currentPlayerId, line);

        if (output) {
            console.log(output);
        }

        rl.prompt();
    } catch (err) {
        rl.prompt();
        console.log(err.stack);
    }
}).on('close', () => {
    process.exit(0);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
    write(`${data.type} dice roll required, ${data.maxDice} dice available`);
    rl.prompt();
});

Object.keys(aiEventEmitters).forEach(playerId => {
    playerId = Number.parseInt(playerId, 10);
    let aiEvent = aiEventEmitters[playerId];

    aiEvent.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
        risk.act.rollDice(playerId, data.maxDice);
    });
});

risk.start();




















//
//
// function exit() {
//     console.log('done');
//     process.exit(0);
// }
//
// let i = 0;
// function promptLoop() {
//     i++
//
//     if (risk.isGameOver()) {
//         console.log(asciiMap(risk.board.getTerritories()));
//         console.log('############', i)
//
//         exit();
//     }
//
//     if (playerIds.includes(risk.currentPlayer.id) || (risk.battle && playerIds.includes(risk.battle.currentPlayer))) {
//         rl.prompt();
//     }
//
//     if (!playerIds.includes(risk.currentPlayer.id) || (risk.battle && !playerIds.includes(risk.battle.currentPlayer))) {
//         aiAction();
//
//         if (risk.battle && playerIds.includes(risk.battle.currentPlayer)) {
//             rl.prompt();
//         } else {
//             promptLoop();
//         }
//     }
// }
//
// promptLoop();
//
// rl.on('line', line => {
//     try {
//         let playerId = null;
//
//         // Necessary to check this first, if more than 1 players
//         if (risk.battle && playerIds.includes(risk.battle.currentPlayer)) {
//             playerId = risk.battle.currentPlayer;
//         } else if (playerIds.includes(risk.currentPlayer.id)) {
//             playerId = risk.currentPlayer.id;
//         }
//
//         if (playerId !== null) {
//             let output = commandParser(risk, playerId, line);
//
//             if (output) {
//                 console.log(output);
//             }
//         }
//
//         promptLoop();
//     } catch (err) {
//         rl.prompt();
//         console.log(err.stack);
//     }
// }).on('close', () => {
//     process.exit(0);
// });
//
// function aiAction() {
//     if (risk.phase === risk.PHASES.SETUP_A) {
//         simulateSetupA();
//     } else if (risk.phase === risk.PHASES.SETUP_B) {
//         simulateSetupB();
//     } else if (risk.phase === risk.PHASES.BATTLE) {
//         simulateBattle();
//     }
// }
//
// let playerInBattle = false;
//
// function simulateAttack() {
//     let player = risk.currentPlayer;
//     let battle = risk.battle;
//
//     if (battle) {
//         let battlePlayer = risk.battle.currentPlayer;
//
//         if (!playerIds.includes(battlePlayer)) {
//             if (battle.attacker.player === battlePlayer) {
//                 risk.act.rollDice(battlePlayer, Math.min(3, battle.attacker.units));
//             } else {
//                 risk.act.rollDice(battlePlayer, Math.min(2, battle.defender.units));
//             }
//         }
//     } else {
//         let attack = risk.utils.ai.whatToAttack(player.id);
//
//         if (Math.random() > 0.5 && attack) {
//             risk.act.attack(player.id, attack.from.id, attack.to.id, attack.units);
//         } else {
//             risk.act.fortifyPhase(player.id);
//         }
//     }
// }
//
// function simulateBattle() {
//     let player = risk.currentPlayer;
//
//     if (risk.turnPhase === risk.TURN_PHASES.PLACEMENT) {
//         redeemCards(player);
//
//         let placements = risk.utils.ai.whereToDeployUnits(risk.currentPlayer.id);
//
//         for (let placement of placements) {
//             risk.act.deployUnits(player.id, placement.territory.id, placement.units);
//         }
//
//         risk.act.attackPhase(player.id);
//     }
//
//     if (!risk.isGameOver()) {
//         if (risk.turnPhase === risk.TURN_PHASES.FORTIFYING) {
//             moveUnits(player);
//             risk.act.endTurn(player.id);
//         } else {
//             simulateAttack();
//         }
//     }
// }
//
// function moveUnits (player) {
//     let movements = risk.utils.ai.whichUnitsToMove(player.id);
//
//     for (let move of movements) {
//         risk.act.moveUnits(player.id, move.from.id, move.to.id, move.units);
//     }
// }
//
// function redeemCards (player) {
//     while (risk.getCards(player.id).length > 4) {
//         let combinations = () => {
//             return getCombinations(risk.getCards(player.id).slice(0, 5));
//         };
//
//         for (let combination of combinations()) {
//             if (risk.utils.isValidCardCombo(combination)) {
//                 risk.act.redeemCards(player.id, combination);
//
//                 break;
//             }
//         }
//     }
// }
//
// function simulateSetupA() {
//     let player = risk.currentPlayer;
//     let availableTerritories = risk.board.getAvailableTerritories();
//     let territory = randomValue(availableTerritories);
//
//     risk.act.claimTerritory(player.id, territory.id);
// }
//
// function simulateSetupB() {
//     let player = risk.currentPlayer;
//     let territory = randomValue(player.territoryIds);
//
//     risk.act.deployOneUnit(player.id, territory);
// }
