'use strict';

const Game = require('./lib/risk/Game');

let game = new Game(3);

game.start();

// setup phase
game.occupy(0, 'greenland');

