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

function nearEnemeyTerritory (territories) {
    for (let territory of territories) {
        if (territory.units > 1) {
            let attackTerritories = territory.enemyAdjacentTerritories();
            if (attackTerritories.length > 0) {
                return territory;
            }
        }
    }

    return randomValue(territories);
}


let turn = 0;
while (game.players.size > 1) {
    turn++;

    for (let player of game.players.values()) {
        let id = player.id;

        let availableUnits = game.playerAvailableUnits(id);
        let territories = game.playerTerritories(id);

        debug('territories taken', territories.map(territory => territory.id));
        debug('units available', availableUnits);

        let placementTerritory = randomValue(territories);

        if (id === 0) {
            placementTerritory = nearEnemeyTerritory(territories);
        }

        game.placeUnits(id, game.playerAvailableUnits(id), placementTerritory.id);

        while (player.cards.size >= 5) {

            let newCombo = () => {
                let combinations = [];

                getCombinations(Array.from(player.cards).slice(0, 5), 0, [], combinations);

                return combinations;
            };

            for (let combo of newCombo()) {
                let cards = combo.map(card => card.id);

                if (game.isValidCardCombination(cards)) {
                    game.redeemCards(id, cards);

                    break;
                }
            }
        }

        if (game.playerAvailableUnits(id) > 0) {
            debug('new units available after card redeem');
            game.placeUnits(id, game.playerAvailableUnits(id), randomValue(territories).id);
        }

        game.nextTurnPhase(id);

        let attackFrom = null;
        let attackTo = null;

        territories = game.playerTerritories(id);

        for (let territory of territories) {
            if (territory.units > 1) {
                let attackTerritories = territory.enemyAdjacentTerritories();
                if (attackTerritories.length > 0) {
                    attackFrom = territory;
                    attackTo = randomValue(attackTerritories);
                }
            }
        }

        // if (attackFrom === null) console.log(territories)

        if (id === 0 && attackFrom) {
            let attackUnits = attackFrom.units - 1;

            debug('attcking territory', attackTo.toString());
            game.attack(id, attackFrom.id, attackTo.id, attackUnits);

            let battleOver = false;

            while (!battleOver) {
                game.roll(id, Math.min(game.battle.attackUnits, 3));
                game.roll(attackTo.occupyingPlayer.id, Math.min(game.battle.defendUnits, 2));

                if (!game.battle) {
                    battleOver = true;
                }
            }
        }

        if (game.isGameOver()) {
            break;
        }

        // TODO simulate movement
        // let p1Territories = game.playerTerritories(0);
        // game.moveTroops(0, p1Territories[1].id, p1Territories[1].ownAdjacentTerritories()[0].id, 1);

        game.nextTurnPhase(id);
        game.endTurn(id);
    }
}

function getCombinations(array, start, initialStuff, output) {
    if (initialStuff.length >= 3) {
        output.push(initialStuff);
    } else {
        var i;

        for (i = start; i < array.length; ++i) {
            getCombinations(array, i + 1, initialStuff.concat(array[i]), output);
        }
    }
}
