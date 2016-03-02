'use strict';

const debug = require('debug')('demo:start');
const Risk = require('./lib/risk');
const Ai = require('./lib/risk/ai');

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
        let availableTerritories = risk.info.availableTerritories;
        let territory = randomValue(availableTerritories);

        risk.act.claimTerritory(player.id, territory.id);
    }
}

function simulateSetupB() {
    while (risk.info.phase === risk.info.PHASES.SETUP_B) {
        let player = risk.currentPlayer;
        let territory = randomValue(player.territories);

        risk.act.deployOneUnit(player.id, territory);
    }
}

function simulateBattle() {
    while (risk.info.phase === risk.info.PHASES.BATTLE) {
        let player = risk.currentPlayer;
        let attack = randomValue(ai.whatToAttack(player));

        let availableUnits = risk.act.availableUnits();

        let placements = ai.whereToDeployUnits(player);

        for (let placement of placements) {
            risk.act.deployUnits(player.id, placement.territory.id, placement.units);
        }

        risk.act.attackPhase(player.id);
        break;
    }
}

simulateSetupA();
simulateSetupB();
simulateBattle();

// let turn = 0;
// while (game.players.size > 1) {
//     for (let player of game.players.values()) {
//         console.log('pla', player.id)
//         let id = player.id;
//
//         let availableUnits = game.playerAvailableUnits(id);
//         let territories = game.playerTerritories(id);
//
//         debug('territories taken', territories.length);
//         debug('units available', availableUnits);
//
//         for (let i = 0; i < Math.floor(Math.random() * territories.length); i++) {
//             let placementTerritory = nearEnemeyTerritory(territories);
//             let randomUnits = Math.round(Math.random() * availableUnits) + 1;
//
//             availableUnits -= randomUnits;
//
//             if (availableUnits > 0) {
//                 game.placeUnits(id, randomUnits, placementTerritory.id);
//             }
//         }
//
//         if (availableUnits > 0) {
//             game.placeUnits(id, availableUnits, nearEnemeyTerritory(territories).id);
//         }
//
//         while (player.cards.size >= 5) {
//             let newCombo = () => {
//                 let combinations = [];
//
//                 getCombinations(Array.from(player.cards).slice(0, 5), 0, [], combinations);
//
//                 return combinations;
//             };
//
//             for (let combo of newCombo()) {
//                 let cards = combo.map(card => card.id);
//
//                 if (game.isValidCardCombination(cards)) {
//                     game.redeemCards(id, cards);
//
//                     break;
//                 }
//             }
//         }
//
//         if (game.playerAvailableUnits(id) > 0) {
//             debug('new units available after card redeem');
//             game.placeUnits(id, game.playerAvailableUnits(id), randomValue(territories).id);
//         }
//
//         game.nextTurnPhase(id);
//
//         let attackFrom = null;
//         let attackTo = null;
//
//         territories = game.playerTerritories(id);
//
//         for (let territory of territories) {
//             if (territory.units > 1) {
//                 let attackTerritories = territory.enemyAdjacentTerritories();
//                 if (attackTerritories.length > 0) {
//                     attackFrom = territory;
//                     attackTo = randomValue(attackTerritories);
//                 }
//             }
//         }
//
//         if (attackFrom) {
//             let attackUnits = attackFrom.units - 1;
//
//             game.attack(id, attackFrom.id, attackTo.id, attackUnits);
//
//             let battleOver = false;
//
//             while (!battleOver) {
//                 game.roll(id, Math.min(game.battle.attackUnits, 3));
//                 game.roll(attackTo.occupyingPlayer.id, Math.min(game.battle.defendUnits, 2));
//
//                 if (!game.battle) {
//                     battleOver = true;
//                 }
//             }
//         }
//
//         if (game.isGameOver()) {
//             break;
//         }
//
//         // TODO simulate movement
//         // let p1Territories = game.playerTerritories(0);
//         // game.moveTroops(0, p1Territories[1].id, p1Territories[1].ownAdjacentTerritories()[0].id, 1);
//
//         game.nextTurnPhase(id);
//         game.endTurn(id);
//     }
// }
//
// function getCombinations(array, start, initialStuff, output) {
//     if (initialStuff.length >= 3) {
//         output.push(initialStuff);
//     } else {
//         var i;
//
//         for (i = start; i < array.length; ++i) {
//             getCombinations(array, i + 1, initialStuff.concat(array[i]), output);
//         }
//     }
// }
