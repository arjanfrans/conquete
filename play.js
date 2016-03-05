'use strict';

const debug = require('debug')('risk:play');
const Risk = require('./lib/risk/index');
const Ai = require('./lib/risk/ai');
const asciiMap = require('./map');
const helper = require('./helper');
const argv = require('minimist')(process.argv.slice(2));

const randomValue = helper.randomValue;
const getCombinations = helper.getCombinations;

const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

let options = {
    mode: 'classic',
    cards: {
        bonuses: {
            infantry: 4,
            cavalry: 6,
            artillery: 8,
            mixed: 10
        }
    }
};

let players = [
    {
        name: 'player1'
    },
    {
        name: 'player2'
    },
    {
        name: 'cpu3'
    },
    {
        name: 'cpu4'
    }
];

let playerIds = [];

if (argv.player) {
    playerIds = [0, 1];
}

let risk = Risk(players, options);
let ai = Ai(risk);

risk.start();

function parseInput(playerId, rawInput) {
    let input = rawInput.split(' ');
    let command = input.shift();
    let args = input;

    switch (command) {
        case 'ct':
        case 'claimTerritory': {
            let territory = args[0];

            if (args[0] === 'random') {
                territory = randomValue(Object.keys(risk.info.availableTerritories));
            }

            risk.act.claimTerritory(playerId, territory);
            break;
        }
        case 'do':
        case 'deployOneUnit': {
            let territory = args[0];

            if (args[0] === 'random') {
                territory = randomValue(risk.currentPlayer.territories);
            }

            risk.act.deployOneUnit(playerId, territory);
            break;
        }
        case 'du':
        case 'deployUnits': {
            let territory = args[0];
            let units = args[1];

            if (args[0] === 'random') {
                territory = randomValue(risk.currentPlayer.territories);
                units = risk.act.availableUnits(playerId);
            }

            risk.act.deployUnits(playerId, territory, units);
            break;
        }
        case 'ap':
        case 'attackPhase':
            risk.act.attackPhase(playerId);
            break;
        case 'a':
        case 'attack':
            risk.act.attack(playerId, args[0], args[1], args[2]);
            break;
        case 'rd':
        case 'rollDice':
            risk.act.rollDice(playerId, args[0]);
            break;
        case 'rc':
        case 'redeemCards':
            risk.act.redeemCards(playerId, args[0], args[1], args[2]);
            break;
        case 'mu':
        case 'moveUnits':
            risk.act.moveUnits(playerId, args[0], args[1], args[2]);
            break;
        case 'fp':
        case 'fortifyPhase':
            risk.act.fortifyPhase(playerId);
            break;
        case 'et':
        case 'endTurn':
            risk.act.endTurn(playerId);
            break;
        case 'au':
        case 'availableUnits':
            return risk.act.availableUnits(playerId);
            break;
        case 'at':
        case 'availableTerritories':
            return Object.keys(risk.info.availableTerritories);
        case 'ca':
        case 'cards':
            return risk.act.cards(playerId);
        case 'map':
            return asciiMap(risk.info.territories);
    }
}

function exit() {
    console.log('done');
    process.exit(0);
}

let i = 0;
function promptLoop() {
    i++;

    if (risk.hasGameEnded()) {
        exit();
    }

    if (playerIds.includes(risk.currentPlayer.id) || (risk.info.battle && playerIds.includes(risk.info.battle.currentPlayer))) {
        rl.prompt();
    }

    if (!playerIds.includes(risk.currentPlayer.id) || (risk.info.battle && !playerIds.includes(risk.info.battle.currentPlayer))) {
        aiAction();


        if (risk.info.battle && playerIds.includes(risk.info.battle.currentPlayer)) {
            rl.prompt();
        } else {
            promptLoop();
        }
    }
}

promptLoop();
let autoSetupA = true;

rl.on('line', line => {
    try {
        let playerId = null;

        // Necessary to check this first, if more than 1 players
        if (risk.info.battle && playerIds.includes(risk.info.battle.currentPlayer)) {
            playerId = risk.info.battle.currentPlayer;
        } else if (playerIds.includes(risk.currentPlayer.id)) {
            playerId = risk.currentPlayer.id;
        }

        if (playerId !== null) {
            let output = parseInput(playerId, line);

            if (output) {
                console.log(output);
            }
        }

        promptLoop();
    } catch (err) {
        rl.prompt();
        console.log(err.stack);
    }
}).on('close', () => {
    process.exit(0);
});

function aiAction() {
    if (risk.info.phase === risk.info.PHASES.SETUP_A) {
        simulateSetupA();
    } else if (risk.info.phase === risk.info.PHASES.SETUP_B) {
        simulateSetupB();
    } else if (risk.info.phase === risk.info.PHASES.BATTLE) {
        simulateBattle();
    }
}

let playerInBattle = false;

function simulateAttack() {
    let player = risk.currentPlayer;
    let battle = risk.info.battle;

    if (battle) {
        let battlePlayer = risk.info.battle.currentPlayer;

        if (!playerIds.includes(battlePlayer)) {
            if (battle.attacker.player === battlePlayer) {
                risk.act.rollDice(battlePlayer, Math.min(3, battle.attacker.units));
            } else {
                risk.act.rollDice(battlePlayer, Math.min(2, battle.defender.units));
            }
        }
    } else {
        let attack = ai.whatToAttack(player);

        if (Math.random() > 0.5 && attack) {
            risk.act.attack(player.id, attack.from.id, attack.to.id, attack.units);
        } else {
            risk.act.fortifyPhase(player.id);
        }
    }
}

function simulateBattle() {
    let player = risk.currentPlayer;

    if (risk.info.turnPhase === risk.info.TURN_PHASES.PLACEMENT) {
        redeemCards(player);

        let placements = ai.whereToDeployUnits(risk.currentPlayer);

        for (let placement of placements) {
            risk.act.deployUnits(player.id, placement.territory.id, placement.units);
        }

        risk.act.attackPhase(player.id);
    }

    if (!risk.hasGameEnded()) {
        if (risk.info.turnPhase === risk.info.TURN_PHASES.FORTIFYING) {
            moveUnits(player);
            risk.act.endTurn(player.id);
        } else {
            simulateAttack();
        }
    }
}

function moveUnits (player) {
    let movements = ai.whichUnitsToMove(player);

    for (let move of movements) {
        risk.act.moveUnits(player.id, move.from.id, move.to.id, move.units);
    }
}

function redeemCards (player) {
    while (risk.act.cards(player.id).length > 4) {
        let combinations = () => {
            return getCombinations(Array.from(risk.act.cards(player.id)).slice(0, 5));
        };

        for (let combination of combinations()) {
            if (risk.info.areCardsValid(combination)) {
                risk.act.redeemCards(player.id, ...combination);

                break;
            }
        }
    }
}

function simulateSetupA() {
    let player = risk.currentPlayer;
    let availableTerritories = Object.keys(risk.info.availableTerritories);
    let territory = randomValue(availableTerritories);

    risk.act.claimTerritory(player.id, territory);
}

function simulateSetupB() {
    let player = risk.currentPlayer;
    let territory = randomValue(player.territories);

    risk.act.deployOneUnit(player.id, territory);
}
