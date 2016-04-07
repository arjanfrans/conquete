# Conquête - The Risk board game in JavaScript

[![npm version](https://img.shields.io/npm/v/conquete.svg)](https://www.npmjs.com/package/conquete)
[![Build Status](https://travis-ci.org/arjanfrans/conquete.svg?branch=master)](https://travis-ci.org/arjanfrans/conquete)
[![Coverage Status](https://coveralls.io/repos/arjanfrans/conquete/badge.svg)](https://coveralls.io/r/arjanfrans/conquete)
[![Dependency Status](https://david-dm.org/arjanfrans/conquete.svg)](https://david-dm.org/arjanfrans/conquete)
[![devDependency Status](https://david-dm.org/arjanfrans/conquete/dev-status.svg)](https://david-dm.org/arjanfrans/conquete#info=devDependencies)

This JavaScript module contains the logic for the Risk board game.

## Installation

```
npm install --save conquete
```


## Usage

A game is initialized with an `EventEmitter` that listens for all game events and an options object. This options object includes
the map, game rules, and an array of players. Each player has a `listener`, which is an `EventEmitter` that listens to events targeted at that player.
Optionally a state can be passed in to resume a game from a given state.

```javaScript
const conquete = require('conquete');
const EventEmitter = require('events');

const gameEvents = new EventEmitter();
const playerOneEvents = new EventEmitter();
const playerTwoEvents = new EventEmitter();
const playerThreeEvents = new EventEmitter();

const options = {
    map: conquete.maps.classic(), // Map to use
    debug: false, // Debug mode (shows logs)
    startUnits: { // Number of starting units  for the given amount of players
        '2': 40,
        '3': 35,
        '4': 30,
        '5': 25,
        '6': 20
    },
    players: [ // Players
        {
            id: 'p1',
            listener: playerOneEvents // EventEmitter that listens to events for this player
        },
        {
            id: 'c2',
            listener: playerTwoEvents
        }, {
            id: 'c3',
            listener: playerThreeEvents
        }
    ],
    jokerCards: 2, // number of joker cards (default: 2)
    cardBonus: [ // valid card combinations and their bonuses
        {
            cards: ['cavalry', 'artillery', 'infantry'],
            bonus: 10
        },
        {
            cards: ['artillery', 'artillery', 'artillery'],
            bonus: 8,
        },
        {
            cards: ['cavalry', 'cavalry', 'cavalry'],
            bonus: 6,
        },
        {
            cards: ['infantry', 'infantry', 'infantry'],
            bonus: 4,
        }
    ]
};

const game = conquete.Game(gameEvents, options);

```

### Errors

Errors that the game can thrown can be found here:
* [Game errors](./lib/risk/errors/game-errors.js): All errors that can be thrown during a game.
* [Validation errors](./lib/risk/errors/validation-errors.js): All errors that can be thrown during initialization.

### Game events

The game is can emit the following events:
* [Game events](./lib/risk/events/game-events.js): Events that are emitted to all players.
* [Player events](./lib/risk/events/player-events.js): Events that are emitted to only the relevant player.

### Save and load a state

You can get the current game state by reading the `state` property on the game object. You could save this state and load it into
the game.

```javascript
// Read the state from a game
const state = game.state;

const newGame = conquete.Game(gameEvents, options, state);
```
