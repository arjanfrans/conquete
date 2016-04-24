'use strict';

const expect = require('chai').expect;
const EventEmitter = require('events');
const risk = require('../../lib/risk');
const state = require('../states/redeem-cards');

describe('redeem cards in placement phase', function () {
    const gameListener = new EventEmitter();
    const playerListener = new EventEmitter();

    const options = {
        listener: gameListener,
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

    const game = risk.Game(options, state);

    const gameEvents = Object.keys(risk.GAME_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    const playerEvents = Object.keys(risk.PLAYER_EVENTS).reduce((prev, eventName) => {
        prev[eventName] = [];

        return prev;
    }, {});

    let numberOfCardsError = null;
    let notOwnCards = null;

    let invalidComboError = null;
    let invalidCombination = null;
    let validCombination = null;
    let cards = null;
    let availableUnitsBefore = null;

    before(function () {
        for (const gameEvent of Object.keys(gameEvents)) {
            gameListener.on(risk.GAME_EVENTS[gameEvent], data => {
                gameEvents[gameEvent].push(data);
            });
        }

        playerListener.on(risk.PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, data => {
            playerEvents.REQUIRE_PLACEMENT_ACTION.push(data);

            availableUnitsBefore = game.getAvailableUnits(data.playerId);

            cards = game.getCards(data.playerId);

            try {
                game.act.redeemCards(data.playerId, []);
            } catch (err) {
                numberOfCardsError = err;
            }

            try {
                game.act.redeemCards(data.playerId, ['a_1', 'a_2', 'a_3']);
            } catch (err) {
                notOwnCards = err;
            }

            invalidCombination = data.cards.slice(1, 4);

            try {
                game.act.redeemCards(data.playerId, invalidCombination);
            } catch (err) {
                invalidComboError = err;
            }

            validCombination = data.cards.slice(0, 3);

            game.act.redeemCards(data.playerId, validCombination);
        });

        game.start();
    });

    it('all possible valid card combos from the options are correct', function () {
        expect(game.utils.validCardCombos()).to.deep.equal([
            ['cavalry', 'artillery', 'infantry'],
            ['artillery', 'artillery', 'artillery'],
            ['cavalry', 'cavalry', 'cavalry'],
            ['infantry', 'infantry', 'infantry']
        ]);
    });

    it('invalid combination and number throw errors', function () {
        expect(numberOfCardsError.name).to.equal('NumberOfCardsError');
        expect(numberOfCardsError.message).to.match(/^You must redeem 3 cards.$/);

        expect(notOwnCards.name).to.equal('NotOwnCardsError');
        expect(notOwnCards.message).to.match(/^You do not have these cards: "a_1", /);
        expect(notOwnCards.data.cards).to.deep.equal(['a_1', 'a_2', 'a_3']);

        expect(invalidComboError.name).to.equal('InvalidCardsError');
        expect(invalidComboError.data.cards).to.deep.equal(invalidCombination);

        const invalidComboMessage = `Card combination ${invalidCombination.map(card => `"${card}"`).join(', ')} is invalid.`;

        expect(invalidComboError.message).to.equal(invalidComboMessage);
    });

    it('emitted cards are correct', function () {
        const emittedCards = playerEvents.REQUIRE_PLACEMENT_ACTION[0].cards;

        expect(emittedCards).to.deep.equal(cards);
        expect(cards).to.have.length(4);

        expect(playerEvents.REQUIRE_PLACEMENT_ACTION).to.have.length(1);
    });

    it('redeemed combination is valid', function () {
        expect(game.utils.isValidCardCombo(invalidCombination)).to.equal(false);
        expect(game.utils.isValidCardCombo(validCombination)).to.equal(true);
    });

    it('too many cards are not valid', function () {
        expect(game.utils.isValidCardCombo(cards)).to.equal(false);
    });

    it('REDEEM_CARDS is emitted', function () {
        expect(gameEvents.REDEEM_CARDS).to.have.length(1);
        expect(gameEvents.REDEEM_CARDS[0].cards).to.deep.equal(validCombination);
        expect(gameEvents.REDEEM_CARDS[0].bonus).to.equal(6);
        expect(gameEvents.REDEEM_CARDS[0].playerId).to.equal(playerEvents.REQUIRE_PLACEMENT_ACTION[0].playerId);
        expect(gameEvents.REDEEM_CARDS[0].message).to.match(/^Player "1" redeemed cards/);
    });

    it('available units has the bonus added', function () {
        expect(game.getAvailableUnits(gameEvents.REDEEM_CARDS[0].playerId)).to.equal(availableUnitsBefore + 6);
    });
});
