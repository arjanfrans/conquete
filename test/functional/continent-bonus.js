'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');
const stateBattle = require('../states/placement-continent-bonus');

describe('placement phase continent bonus', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();
    const options = {
        players: [
            {
                id: '1',
                listener: playerListener
            },
            {
                id: '2',
                listener: playerListener
            }, {
                id: '3',
                listener: playerListener
            }
        ]
    };

    const game = risk.Game(gameListener, options, stateBattle);

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    let continents = null;
    let playerContinents = null;

    before(function () {
        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
            playerEvents.REQUIRE_PLACEMENT_ACTION.push(data);

            continents = game.board.getContinents();
            playerContinents = continents.filter(continent => continent.owner === data.playerId);
        });

        game.start();
    });

    it('territory and continent bonus is available', function () {
        const playerId = stateBattle.turn.player;

        expect(playerEvents.REQUIRE_PLACEMENT_ACTION).to.have.length(1);
        expect(playerEvents.REQUIRE_PLACEMENT_ACTION[0].playerId).to.equal(playerId);

        const player = stateBattle.players.find(player => player.id === playerId);
        const territoryCount = player.territoryIds.length;

        expect(continents).to.have.length(stateBattle.board.continents.length);
        expect(playerContinents).to.have.length(1);

        const expectedBonus = Math.floor(territoryCount / 3) + playerContinents[0].bonus;

        expect(playerEvents.REQUIRE_PLACEMENT_ACTION[0].units).to.equal(expectedBonus);
    });

    it('continent has the correct territories', function () {
        const playerId = playerEvents.REQUIRE_PLACEMENT_ACTION[0].playerId;
        const continent = game.board.getContinent(playerContinents[0].id);

        for (const territoryId of continent.territoryIds) {
            const territory = game.board.getTerritory(territoryId);

            expect(territory.owner).to.equal(playerId);
            expect(territory.continentId).to.equal(continent.id);
        }
    });
});
