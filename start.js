'use strict';

const debug = require('debug')('risk-demo:start');
const Game = require('./lib/risk/Game');

function randomValue (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

let playerCount = 3;
let game = new Game(playerCount);

game.start();

// setup phase
let totalTerritories = game.board.totalTerritories();

let allOccupied = false;

while (!allOccupied) {
    for (let i = 0; i < playerCount; i++) {
        let unoccupied = game.board.getUnoccupiedTerritories();

        if (unoccupied.length === 0) {
            allOccupied = true;
        } else {
            let randomTerritory = randomValue(unoccupied);

            game.occupy(i, randomTerritory.id);
        }
    }
}

debug('all territories occupied', game.board.areAllTerritoriesOccupied());

game.changePhase('setupB');

let startUnitsPlaced = false;

while (!startUnitsPlaced) {
    for (let i = 0; i < playerCount; i++) {
        let noMoreUnits = game.noMoreStartUnits();

        if (noMoreUnits) {
            startUnitsPlaced = true;
        } else {
            let territories = game.playerTerritories(i);
            let territory = randomValue(territories);

            game.deployOneUnit(i, territory.id);
        }
    }
}

debug('all starting units placed', game.noMoreStartUnits());

game.changePhase('battle');

console.log(game.playerContinents(0));
