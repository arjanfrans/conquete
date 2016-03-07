'use strict';

const debug = require('debug')('risk:simulation');
const randomValue = require('./helper').randomValue;
const getCombinations = require('./helper').getCombinations;

function simulation (risk) {

}


risk.start();

function exit() {
    console.log('done');
    process.exit(0);
}

let i = 0;
function promptLoop() {
    i++

    if (risk.isGameOver()) {
        console.log(asciiMap(risk.board.getTerritories()));
        console.log('############', i)

        exit();
    }

    if (playerIds.includes(risk.currentPlayer.id) || (risk.battle && playerIds.includes(risk.battle.currentPlayer))) {
        rl.prompt();
    }

    if (!playerIds.includes(risk.currentPlayer.id) || (risk.battle && !playerIds.includes(risk.battle.currentPlayer))) {
        aiAction();

        if (risk.battle && playerIds.includes(risk.battle.currentPlayer)) {
            rl.prompt();
        } else {
            promptLoop();
        }
    }
}

promptLoop();

rl.on('line', line => {
    try {
        let playerId = null;

        // Necessary to check this first, if more than 1 players
        if (risk.battle && playerIds.includes(risk.battle.currentPlayer)) {
            playerId = risk.battle.currentPlayer;
        } else if (playerIds.includes(risk.currentPlayer.id)) {
            playerId = risk.currentPlayer.id;
        }

        if (playerId !== null) {
            let output = commandParser(risk, playerId, line);

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
    if (risk.phase === risk.PHASES.SETUP_A) {
        simulateSetupA();
    } else if (risk.phase === risk.PHASES.SETUP_B) {
        simulateSetupB();
    } else if (risk.phase === risk.PHASES.BATTLE) {
        simulateBattle();
    }
}

let playerInBattle = false;

function simulateAttack() {
    let player = risk.currentPlayer;
    let battle = risk.battle;

    if (battle) {
        let battlePlayer = risk.battle.currentPlayer;

        if (!playerIds.includes(battlePlayer)) {
            if (battle.attacker.player === battlePlayer) {
                risk.act.rollDice(battlePlayer, Math.min(3, battle.attacker.units));
            } else {
                risk.act.rollDice(battlePlayer, Math.min(2, battle.defender.units));
            }
        }
    } else {
        let attack = risk.utils.ai.whatToAttack(player.id);

        if (Math.random() > 0.5 && attack) {
            risk.act.attack(player.id, attack.from.id, attack.to.id, attack.units);
        } else {
            risk.act.fortifyPhase(player.id);
        }
    }
}

function simulateBattle() {
    let player = risk.currentPlayer;

    if (risk.turnPhase === risk.TURN_PHASES.PLACEMENT) {
        redeemCards(player);

        let placements = risk.utils.ai.whereToDeployUnits(risk.currentPlayer.id);

        for (let placement of placements) {
            risk.act.deployUnits(player.id, placement.territory.id, placement.units);
        }

        risk.act.attackPhase(player.id);
    }

    if (!risk.isGameOver()) {
        if (risk.turnPhase === risk.TURN_PHASES.FORTIFYING) {
            moveUnits(player);
            risk.act.endTurn(player.id);
        } else {
            simulateAttack();
        }
    }
}

function moveUnits (player) {
    let movements = risk.utils.ai.whichUnitsToMove(player.id);

    for (let move of movements) {
        risk.act.moveUnits(player.id, move.from.id, move.to.id, move.units);
    }
}

function redeemCards (player) {
    while (risk.getCards(player.id).length > 4) {
        let combinations = () => {
            return getCombinations(risk.getCards(player.id).slice(0, 5));
        };

        for (let combination of combinations()) {
            if (risk.utils.isValidCardCombo(combination)) {
                risk.act.redeemCards(player.id, combination);

                break;
            }
        }
    }
}

function simulateSetupA() {
    let player = risk.currentPlayer;
    let availableTerritories = risk.board.getAvailableTerritories();
    let territory = randomValue(availableTerritories);

    risk.act.claimTerritory(player.id, territory.id);
}

function simulateSetupB() {
    let player = risk.currentPlayer;
    let territory = randomValue(player.territoryIds);

    risk.act.deployOneUnit(player.id, territory);
}
