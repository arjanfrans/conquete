'use strict';

const debug = require('debug')('demo:start');
const Risk = require('./lib/risk');
const Ai = require('./lib/risk/ai');
const asciiMap = require('./map');

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

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
        name: 'p1'
    },
    {
        name: 'p2'
    },
    {
        name: 'p3'
    }
];


let risk = Risk(players, options);

risk.start();

let ai = Ai(risk);

// setup phase

function simulateSetupA() {
    while (risk.info.phase === risk.info.PHASES.SETUP_A) {
        let player = risk.currentPlayer;
        let availableTerritories = Object.keys(risk.info.availableTerritories);
        let territory = randomValue(availableTerritories);

        risk.act.claimTerritory(player.id, territory);
    }
}

function simulateSetupB() {
    while (risk.info.phase === risk.info.PHASES.SETUP_B) {
        let player = risk.currentPlayer;
        let territory = randomValue(player.territories);

        risk.act.deployOneUnit(player.id, territory);
    }
}

function simulateAttack(player, attack) {
    risk.act.attack(player.id, attack.from.id, attack.to.id, attack.units);

    while (risk.info.battle) {
        let battle = risk.info.battle;

        risk.act.rollDice(player.id, Math.min(3, battle.attacker.units));

        risk.act.rollDice(battle.defender.player, Math.min(2, battle.defender.units));
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

function moveUnits (player) {
    let movements = ai.whichUnitsToMove(player);

    for (let move of movements) {
        risk.act.moveUnits(player.id, move.from.id, move.to.id, move.units);
    }
}

function simulateBattle() {
    while (risk.info.phase === risk.info.PHASES.BATTLE) {
        let player = risk.currentPlayer;
        let availableUnits = risk.act.availableUnits();

        redeemCards(player);

        let placements = ai.whereToDeployUnits(risk.currentPlayer);

        for (let placement of placements) {
            risk.act.deployUnits(player.id, placement.territory.id, placement.units);
        }

        risk.act.attackPhase(player.id);

        let keepAttacking = true;

        while (keepAttacking && !risk.hasGameEnded()) {
            let attack = ai.whatToAttack(player);

            if (Math.random() > 0.5 && attack) {
                simulateAttack(player, attack);
            } else {
                keepAttacking = false;
                risk.act.fortifyPhase(player.id);
            }
        }

        if (!risk.hasGameEnded()) {
            moveUnits(player);

            risk.act.endTurn(player.id);
        }
    }
}

simulateSetupA();
simulateSetupB();
simulateBattle();

let mapOutput = asciiMap(risk.info.territories);

console.log(mapOutput);

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
