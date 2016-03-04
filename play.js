'use strict';

const debug = require('debug')('risk:play');
const Risk = require('./lib/risk');
const Ai = require('./lib/risk/ai');
const asciiMap = require('./map');

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
        name: 'cpu2'
    },
    {
        name: 'cpu3'
    }
];

let playerId = 0;

let risk = Risk(players, options);
let ai = Ai(risk);

risk.start();

function parseInput(rawInput) {
    let input = rawInput.split(' ');
    let command = input.shift();
    let args = input;
    console.log(args);

    switch (command) {
        case 'claimTerritory':
            let territory = args[0];

            if (args[0] === 'random') {
                territory = randomValue(Object.keys(risk.info.availableTerritories));
            }

            risk.act.claimTerritory(playerId, territory);
            break;
        case 'deployOneUnit':
            risk.act.deployOneUnit(playerId, args[0]);
            break;
        case 'deployUnits':
            risk.act.deployUnits(playerId, args[0], args[1]);
            break;
        case 'attackPhase':
            risk.act.attackPhase(playerId);
            break;
        case 'attack':
            risk.act.attack(playerId, args[0], args[1], args[2]);
            break;
        case 'rollDice':
            risk.act.rollDice(playerId, args[0]);
            break;
        case 'redeemCards':
            risk.act.redeemCards(playerId, args[0], args[1], args[2]);
            break;
        case 'moveUnits':
            risk.act.moveUnits(playerId, args[0], args[1], args[2]);
            break;
        case 'fortifyPhase':
            risk.act.fortifyPhase(playerId);
            break;
        case 'endTurn':
            risk.act.endTurn(playerId);
            break;
        case 'availableUnits':
            return risk.act.availableUnits(playerId);
            break;
        case 'availableTerritories':
            return Object.keys(risk.info.availableTerritories);
        case 'map':
            return asciiMap(risk.info.territories);
    }
}

while (risk.currentPlayer.id !== playerId) {
    aiAction();
}

rl.prompt();

rl.on('line', line => {
    try {
        if (risk.currentPlayer.id === playerId) {
            let output = parseInput(line);

            if (output) {
                console.log(output);
            }
        }

        while (risk.currentPlayer.id !== playerId ||
            (risk.info.battle && risk.info.battle.currentPlayer !== playerId)) {
            aiAction();

            if (risk.info.battle && risk.info.battle.defender.player === playerId) {
                break;
            }
        }

        rl.prompt();
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

function simulateAttack(player, attack) {
    let battle = risk.info.battle;

    if (battle) {
        if (battle.attacker.player === player.id) {
            risk.act.rollDice(player.id, Math.min(3, battle.attacker.units));
        } else if (battle.defender.player === player.id) {
            risk.act.rollDice(player.id, Math.min(2, battle.defender.units));
        }
    } else {
        risk.act.attack(player.id, attack.from.id, attack.to.id, attack.units);

        if (attack.to.id !== playerId) {
            while (risk.info.battle) {
                debug('battle between AI')
                let battle = risk.info.battle;

                risk.act.rollDice(player.id, Math.min(3, battle.attacker.units));
                risk.act.rollDice(battle.defender.player, Math.min(2, battle.defender.units));
            }
        }
    }
}

function simulateBattle() {
    let player = risk.currentPlayer;

    if (!risk.info.battle) {
        redeemCards(player);

        let placements = ai.whereToDeployUnits(risk.currentPlayer);

        for (let placement of placements) {
            risk.act.deployUnits(player.id, placement.territory.id, placement.units);
        }
    }

    if (risk.info.battle) {
        simulateAttack(player);
    } else if (risk.info.turnPhase !== risk.info.TURN_PHASES.ATTACKING) {
        risk.act.attackPhase(player.id);
    }

    if (!risk.hasGameEnded()) {
        let keepAttacking = true;

        while (keepAttacking && risk.info.battle.defender.player !== playerId) {
            let attack = ai.whatToAttack(player);

            if (Math.random() > 0.5 && attack) {
                simulateAttack(player, attack);
            } else {
                keepAttacking = false;
                risk.act.fortifyPhase(player.id);
            }
        }

        moveUnits(player);

        risk.act.endTurn(player.id);
    }
}

function moveUnits (player) {
    let movements = ai.whichUnitsToMove(player);

    for (let move of movements) {
        risk.act.moveUnits(player.id, move.from.id, move.to.id, move.units);
    }
}

function redeemCards (player) {
    while (risk.currentPlayer.cards.length > 4) {
        let combinations = () => {
            return getCombinations(Array.from(risk.currentPlayer.cards).slice(0, 5));
        };

        for (let combination of combinations()) {
            if (risk.info.areCardsValid(combination)) {
                risk.act.redeemCards(player.id, combination);

                break;
            }
        }
    }
}

function getCombinations(array, start, initialStuff, output) {
    start = start || 0;
    initialStuff = initialStuff || [];
    output = output || [];

    if (initialStuff.length >= 3) {
        output.push(initialStuff);
    } else {
        var i;

        for (i = start; i < array.length; ++i) {
            getCombinations(array, i + 1, initialStuff.concat(array[i]), output);
        }
    }

    return output;
}

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


