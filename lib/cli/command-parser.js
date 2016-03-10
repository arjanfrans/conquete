'use strict';

const asciiMap = require('./map');
const helper = require('./helper');

const randomValue = helper.randomValue;

function parseInput(risk, playerId, rawInput) {
    let input = rawInput.split(' ');
    let command = input.shift();
    let args = input;

    switch (command) {
        case 'ct':
        case 'claimTerritory': {
            let territoryId = args[0];

            if (args[0] === 'random') {
                let random = randomValue(risk.board.getAvailableTerritories());

                territoryId = random ? random.id : null;
            }

            risk.act.claimTerritory(playerId, territoryId);
            break;
        }
        case 'do':
        case 'deployOneUnit': {
            let territoryId = args[0];

            if (args[0] === 'random') {
                territoryId = randomValue(risk.currentPlayer.territoryIds);
            }

            risk.act.deployOneUnit(playerId, territoryId);
            break;
        }
        case 'du':
        case 'deployUnits': {
            let territoryId = args[0];
            let units = args[1];

            if (args[0] === 'random') {
                territoryId = randomValue(risk.currentPlayer.territoryIds);
                units = risk.getAvailableUnits(playerId);
            }

            risk.act.deployUnits(playerId, territoryId, units);
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
            risk.act.redeemCards(playerId, [args[0], args[1], args[2]]);
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
            return risk.getAvailableUnits(playerId);
        case 'at':
        case 'availableTerritories':
            return risk.board.getAvailableTerritories();
        case 'ca':
        case 'cards':
            return risk.getCards(playerId);
        case 'map':
            return asciiMap(risk.board.getTerritories());
        case 'save':
            risk.saveState();
            break;
    }
}

module.exports = parseInput;
