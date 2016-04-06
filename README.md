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

### Save and load a state

You can get the current game state by reading the `state` property on the game object. You could save this state and load it into
the game.

```javascript
// Read the state from a game
const state = game.state;

const newGame = conquete.Game(gameEvents, options, state);
```

### Game events

```javascript
const GAME_EVENTS = {
    GAME_START: 'game_start',
    TURN_CHANGE: 'turn_change',
    PHASE_CHANGE: 'phase_change',
    TURN_PHASE_CHANGE: 'turn_phase_change',
    ATTACK: 'attack',
    TERRITORY_CLAIMED: 'territory_claimed',
    DEPLOY_UNITS: 'deploy_units',
    REDEEM_CARDS: 'redeem_cards',
    PLAYER_DEFEATED: 'player_defeated',
    ATTACK_DICE_ROLL: 'attack_dice_roll',
    DEFEND_DICE_ROLL: 'defend_dice_roll',
    BATTLE_END: 'battle_end',
    MOVE_UNITS: 'move_units',
    GAME_END: 'game_end'
};

const gameEvents = new EventEmitter();

gameEvents.on(EVENTS.GAME_START, () => {
    console.log('game started');
});

gameEvents.on(EVENTS.TURN_CHANGE, data => {
    console.log(`turn changed to player ${data.playerId}`);
    if (playerIds.includes(data.playerId)) {
        currentPlayerId = data.playerId;
    } else {
        currentPlayerId = null;
    }
});

gameEvents.on(EVENTS.PHASE_CHANGE, data => {
    console.log(`game phase changed to ${data.phase}`);
});

gameEvents.on(EVENTS.TURN_PHASE_CHANGE, data => {
    console.log(`turn phase changed to ${data.phase}`);
});

gameEvents.on(EVENTS.TERRITORY_CLAIMED, data => {
    console.log(`territory ${data.territoryId} claimed by player ${data.playerId}`);
});

gameEvents.on(EVENTS.DEPLOY_UNITS, data => {
    console.log(`${data.units} units deployed in territory ${data.territoryId} by player ${data.playerId}`);
});

gameEvents.on(EVENTS.ATTACK, data => {
    console.log('attack initiated', data);
});

gameEvents.on(EVENTS.ATTACK_DICE_ROLL, data => {
    console.log(`attacker rolled dice: ${data.dice.join(', ')}`);
});

gameEvents.on(EVENTS.REDEEM_CARDS, data => {
    console.log(`player ${data.playerId} redeemed cards: ${data.cards.join(', ')} (bonus: ${data.bonus})`);
});

gameEvents.on(EVENTS.DEFEND_DICE_ROLL, data => {
    console.log(`defender rolled dice: ${data.dice.join(', ')}`);

    let res = data.results;

    if (res.attackKilled > 0) {
        console.log(`attacker units killed: ${res.attackKilled}`);
    }

    if (res.defendKilled > 0) {
        console.log(`defender units killed: ${res.defendKilled}`);
    }

    console.log(`attacker units remaining ${res.attackRemaining}, defender units remaining ${res.defendRemaining}`);
});

gameEvents.on(EVENTS.BATTLE_END, data => {
    let attack = data.type === 'attack' ? 'attacking' : 'defending';

    console.log(`battle ended, ${attack} player ${data.winner} won`);
});

gameEvents.on(EVENTS.MOVE_UNITS, data => {
    for (let move of data.movements) {
        console.log(`${move.units} units moved by player ${data.playerId} from ${move.from} to ${move.to}`);
    }
});

gameEvents.on(EVENTS.GAME_END, data => {
    console.log(`game has ended, winner: ${data.winner}`);
    process.exit(0);
});
```

### Player events

```javascript
const PLAYER_EVENTS = {
    NEW_CARD: 'new_card',
    REQUIRE_TERRITORY_CLAIM: 'require_territory_claim',
    REQUIRE_ONE_UNIT_DEPLOY: 'require_unit_deploy',
    REQUIRE_PLACEMENT_ACTION: 'require_placement_action',
    REQUIRE_ATTACK_ACTION: 'require_attack_action',
    REQUIRE_FORTIFY_ACTION: 'require_fortify_action',
    REQUIRE_DICE_ROLL: 'require_dice_roll',
    QUEUED_MOVE: 'queued_move',
};

const playerEvents = new EventEmitter();

playerEvents.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
    console.log(`${data.type} dice roll required, ${data.maxDice} dice available`);
});

playerEvents.on(PLAYER_EVENTS.NEW_CARD, data => {
    console.log(`new card received: ${data.card}`);
});

playerEvents.on(PLAYER_EVENTS.QUEUED_MOVE, data => {
    console.log(`${data.units} units queued to move from ${data.from} to ${data.to}`);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
    console.log(`claim a territory: ${data.availableTerritoryIds.join(', ')}`);
    rl.prompt();
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
    console.log(`deploy 1 unit to one of your territitories (${data.availableUnits} units remaining)`);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
    console.log(`redeem cards and deploy units (${data.availableUnits} units available)`);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
    console.log(`attack or continue to fortify`);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
    console.log(`move units or end your turn`);
});
```
