'use strict';

const asciiMap = require('./map');
const helper = require('./helper');
const fs = require('fs');

const randomValue = helper.randomValue;

function parseInput(game, playerColors, playerId, rawInput) {
    let input = rawInput.split(' ');
    let command = input.shift();
    let args = input;

    switch (command) {
        case 'ct':
        case 'claimTerritory': {
            let territoryId = args[0];

            if (args[0] === 'random') {
                let random = randomValue(game.board.getAvailableTerritories());

                territoryId = random ? random.id : null;
            }

            game.act.claimTerritory(playerId, territoryId);
            break;
        }
        case 'do':
        case 'deployOneUnit': {
            let territoryId = args[0];

            if (args[0] === 'random') {
                console.log(game)
                territoryId = randomValue(game.currentPlayer.territoryIds);
            }

            game.act.deployOneUnit(playerId, territoryId);
            break;
        }
        case 'du':
        case 'deployUnits': {
            let territoryId = args[0];
            let units = args[1];

            if (args[0] === 'random') {
                territoryId = randomValue(game.currentPlayer.territoryIds);
                units = game.getAvailableUnits(playerId);
            }

            game.act.deployUnits(playerId, territoryId, units);
            break;
        }
        case 'ap':
        case 'attackPhase':
            game.act.attackPhase(playerId);
            break;
        case 'a':
        case 'attack':
            game.act.attack(playerId, args[0], args[1], args[2]);
            break;
        case 'rd':
        case 'rollDice':
            game.act.rollDice(playerId, args[0]);
            break;
        case 'rc':
        case 'redeemCards':
            game.act.redeemCards(playerId, [args[0], args[1], args[2]]);
            break;
        case 'mu':
        case 'moveUnits':
            game.act.moveUnits(playerId, args[0], args[1], args[2]);
            break;
        case 'fp':
        case 'fortifyPhase':
            game.act.fortifyPhase(playerId);
            break;
        case 'et':
        case 'endTurn':
            game.act.endTurn(playerId);
            break;
        case 'au':
        case 'availableUnits':
            return game.getAvailableUnits(playerId);
        case 'at':
        case 'availableTerritories':
            return game.board.getAvailableTerritories();
        case 'ca':
        case 'cards':
            return game.getCards(playerId);
        case 'map':
            return asciiMap(game.board.getTerritories(), playerColors);
        case 'save':
            const output = game.state;

            fs.writeFileSync('./risk_state', JSON.stringify(output, null, 4));
            break;
    }
}

module.exports = parseInput;
