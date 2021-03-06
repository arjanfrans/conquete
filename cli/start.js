'use strict';

const debug = require('debug')('game:play');
const argv = require('minimist')(process.argv.slice(2));
const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface(process.stdin, process.stdout);
const risk = require('../');
const commandParser = require('./command-parser');
const randomValue = require('./helper').randomValue;
const asciiMap = require('./map');
const getCombinations = require('./helper').getCombinations;
const EventEmitter = require('events');
const Simulation = require('./simulation');

const EVENTS = risk.GAME_EVENTS;
const PLAYER_EVENTS = risk.PLAYER_EVENTS;

let state = null;

// state = JSON.parse(fs.readFileSync('./risk_state'));

const playerEvents = new EventEmitter();

const aiEventEmitters = {
    '1': new EventEmitter(),
    '2': new EventEmitter(),
    '3': new EventEmitter()
};

const gameEvents = new EventEmitter();

const options = {
    map: risk.maps.classic(),
    debug: true,
    startUnits: {
        2: 40,
        3: 35,
        4: 30,
        5: 25,
        6: 20
    },
    listener: gameEvents,
    players: [
        {
            id: '1',
            listener: aiEventEmitters['1']
            // listener: playerEvents
        },
        {
            id: '2',
            listener: aiEventEmitters['2']
        }, {
            id: '3',
            listener: aiEventEmitters['3']
        }
    ],
    jokerCards: 2,
    cardBonus: [
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

const PLAYER_COLORS = {
    '1': 'red',
    '2': 'blue',
    '3': 'green'
    // '3': 'yellow',
    // '4': 'cyan',
    // '5': 'magenta'
};

const game = risk.Game(options, state);

// process.exit(1);
const simulation = Simulation(game);

const playerIds = ['1'];
let currentPlayerId = null;

function write (...data) {
    console.log(...data);
}

gameEvents.on(EVENTS.GAME_START, () => {
    write('game started');
});

gameEvents.on(EVENTS.TURN_CHANGE, data => {
    write(`turn changed to player ${data.playerId}`);
    if (playerIds.includes(data.playerId)) {
        currentPlayerId = data.playerId;
    } else {
        currentPlayerId = null;
    }
});

gameEvents.on(EVENTS.PHASE_CHANGE, data => {
    write(`game phase changed to ${data.phase}`);
});

gameEvents.on(EVENTS.TURN_PHASE_CHANGE, data => {
    write(`turn phase changed to ${data.phase}`);
});

gameEvents.on(EVENTS.TERRITORY_CLAIMED, data => {
    write(`territory ${data.territoryId} claimed by player ${data.playerId}`);
});

gameEvents.on(EVENTS.DEPLOY_UNITS, data => {
    write(`${data.units} units deployed in territory ${data.territoryId} by player ${data.playerId}`);
});

gameEvents.on(EVENTS.ATTACK, data => {
    write('attack initiated', data);
});

gameEvents.on(EVENTS.ATTACK_DICE_ROLL, data => {
    write(`attacker rolled dice: ${data.dice.join(', ')}`);
});

gameEvents.on(EVENTS.REDEEM_CARDS, data => {
    write(`player ${data.playerId} redeemed cards: ${data.cards.join(', ')} (bonus: ${data.bonus})`);
});

gameEvents.on(EVENTS.DEFEND_DICE_ROLL, data => {
    write(`defender rolled dice: ${data.dice.join(', ')}`);

    const res = data.results;

    if (res.attackKilled > 0) {
        write(`attacker units killed: ${res.attackKilled}`);
    }

    if (res.defendKilled > 0) {
        write(`defender units killed: ${res.defendKilled}`);
    }

    write(`attacker units remaining ${res.attackRemaining}, defender units remaining ${res.defendRemaining}`);
});

gameEvents.on(EVENTS.BATTLE_END, data => {
    const attack = data.type === 'attacker' ? 'attacking' : 'defending';

    write(`battle ended, ${attack} player ${data.winner} won`);
});

gameEvents.on(EVENTS.MOVE_UNITS, data => {
    for (const move of data.movements) {
        write(`${move.units} units moved by player ${data.playerId} from ${move.from} to ${move.to}`);
    }
});

gameEvents.on(EVENTS.GAME_END, data => {
    write(`game has ended, winner: ${data.winner}`);
    process.exit(0);
});

rl.on('line', line => {
    try {
        const output = commandParser(game, PLAYER_COLORS, currentPlayerId, line);

        if (typeof output !== 'undefined') {
            write(output);
        }

        if (currentPlayerId === game.currentPlayer.id) {
            rl.prompt();
        }
    } catch (err) {
        rl.prompt();
        console.log(err.stack);
    }
}).on('close', () => {
    process.exit(0);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
    write(`${data.type} dice roll required, ${data.maxDice} dice available`);
    currentPlayerId = data.playerId;
    rl.prompt();
});

playerEvents.on(PLAYER_EVENTS.NEW_CARD, data => {
    write(`new card received: ${data.card}`);
});

playerEvents.on(PLAYER_EVENTS.QUEUED_MOVE, data => {
    write(`${data.units} units queued to move from ${data.from} to ${data.to}`);
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
    write(`claim a territory: ${data.territoryIds.join(', ')}`);
    rl.prompt();
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
    write(`deploy 1 unit to one of your territitories (${data.remainingUnits} units remaining)`);
    rl.prompt();
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
    write(`redeem cards and deploy units (${data.units} units available)`);
    rl.prompt();
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, data => {
    write(`attack or continue to fortify`);
    rl.prompt();
});

playerEvents.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
    write(`move units or end your turn`);
    rl.prompt();
});

Object.keys(aiEventEmitters).forEach(playerId => {
    let time = 0;
    let aiEvent = aiEventEmitters[playerId];

    aiEvent.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, data => {
        debug(`${playerId} - ${data.type} dice roll required, ${data.maxDice} dice available`);

        setTimeout(() => {
            game.act.rollDice(playerId, data.maxDice);
        }, time);
    });

    aiEvent.on(PLAYER_EVENTS.NEW_CARD, data => {
        debug(`${playerId} - new card received: ${data.card}`);
    });

    aiEvent.on(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, data => {
        debug(`${playerId} - claim a territory: ${data.territoryIds.join(', ')}`);

        setTimeout(() => {
            simulation.simulateSetupA();
        }, time);
    });

    playerEvents.on(PLAYER_EVENTS.QUEUED_MOVE, data => {
        debug(`${playerId} - ${data.units} units queued to move from ${data.from} to ${data.to}`);
    });

    aiEvent.on(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, data => {
        debug(`${playerId} - deploy 1 unit to one of your territitories (${data.remainingUnits} units remaining)`);

        setTimeout(() => {
            simulation.simulateSetupB();
        }, time);
    });

    aiEvent.on(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
        debug(`${playerId} - redeem cards and deploy units (${data.availableUnits} units available)`);

        setTimeout(() => {
            simulation.simulatePlacement();
        }, time);
    });

    aiEvent.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, (data) => {
        debug(`${playerId} - attack or continue to fortify`);

        setTimeout(() => {
            simulation.simulateAttack();
        }, time);
    });

    aiEvent.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, data => {
        debug(`${playerId} - move units or end your turn`);

        setTimeout(() => {
            simulation.simulateFortify();
        }, time);
    });
});

game.start();
