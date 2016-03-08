'use strict';

const debug = require('debug')('risk:simulation');
const helper = require('../helper');
const randomValue = helper.randomValue;
const getCombinations = helper.getCombinations;

function simulation (risk) {
    function aiAction() {
        if (risk.phase === risk.PHASES.SETUP_A) {
            simulateSetupA();
        } else if (risk.phase === risk.PHASES.SETUP_B) {
            simulateSetupB();
        } else if (risk.phase === risk.PHASES.BATTLE) {
            simulateBattle();
        }
    }

    function simulateAttack() {
        let player = risk.currentPlayer;
        let attack = risk.utils.ai.whatToAttack(player.id);

        if (Math.random() > 0.5 && attack) {
            risk.act.attack(player.id, attack.from.id, attack.to.id, attack.units);
        } else {
            risk.act.fortifyPhase(player.id);
        }
    }
    // function simulateAttack() {
    //     let player = risk.currentPlayer;
    //     let battle = risk.battle;
    //
    //     if (!battle) {
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
    //
    function simulatePlacement () {
        let player = risk.currentPlayer;

        redeemCards(player);

        let placements = risk.utils.ai.whereToDeployUnits(risk.currentPlayer.id);

        for (let placement of placements) {
            risk.act.deployUnits(player.id, placement.territory.id, placement.units);
        }

        risk.act.attackPhase(player.id);
    }

    function simulateBattle() {
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

    return {
        aiAction,
        simulateSetupA,
        simulateSetupB,
        simulatePlacement,
        simulateAttack,
        simulateBattle
    };
}

module.exports = simulation;
