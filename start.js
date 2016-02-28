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

let availableUnits = game.playerAvailableUnits(0);
let territories = game.playerTerritories(0);

debug('territories taken', territories.map(territory => territory.id));
debug('units available', availableUnits);

game.placeUnits(0, game.playerAvailableUnits(0), territories[0].id);

debug('units available', game.playerAvailableUnits(0));

game.nextTurnPhase(0);

let attack = territories[0].enemyAdjacentTerritories()[0];
debug('attcking territory', attack.toString());

game.attack(0, territories[0].id, attack.id, 3);

let battleOver = false;

while (!battleOver) {
    game.roll(0, Math.min(game.battle.attackUnits, 3));
    game.roll(attack.occupyingPlayer.id, Math.min(game.battle.defendUnits, 2));

    if (!game.battle) {
        battleOver = true;
    }
}

game.nextTurnPhase(0);

let p1Territories = game.playerTerritories(0);

game.moveTroops(0, p1Territories[1].id, p1Territories[1].ownAdjacentTerritories()[0].id, 1);

game.endTurn(0);
