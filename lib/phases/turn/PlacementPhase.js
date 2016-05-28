'use strict';

const ERRORS = require('../../errors');
const createError = require('strict-errors').createError;

const events = require('../../events');
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

function PlacementPhase ({ board, emit, cardManager }) {
    let player = null;
    let unitsPlaced = 0;
    let cardBonus = 0;
    const nextTurnPhase = 'attacking';

    function reset () {
        unitsPlaced = 0;
        cardBonus = 0;
    }

    function setPlayer (value) {
        player = value;

        reset();
    }

    function bonusUnits () {
        const territories = board.getPlayerTerritories(player);
        let territoryBonus = Math.floor(territories.length / 3);

        territoryBonus = territoryBonus < 3 ? 3 : territoryBonus;

        const continents = board.getPlayerContinents(player);
        const continentBonus = continents.reduce((totalBonus, continent) => {
            return totalBonus + continent.getBonus();
        }, 0);


        return {
            territoryBonus: territoryBonus,
            continentBonus: continentBonus,
            cardBonus: cardBonus,
            total: territoryBonus + continentBonus + cardBonus
        };
    }

    function getAvailableUnits () {
        const bonus = bonusUnits(player);

        return bonus.total - unitsPlaced;
    }

    function redeemCards (cards) {
        if (cards.length !== 3) {
            throw createError(ERRORS.NumberOfCardsError);
        }

        if (!player.hasCards(cards)) {
            throw createError(ERRORS.NotOwnCardsError, { cards });
        }

        const bonus = cardManager.getBonus(cards);

        for (const card of cards) {
            player.removeCard(card);
            cardManager.pushCard(card);
        }

        cardBonus += bonus;

        emit(GAME_EVENTS.REDEEM_CARDS, {
            playerId: player.getId(),
            cards: cards,
            bonus: bonus
        });
    }


    function deployUnits (territory, units) {
        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsError, { units });
        }

        if (territory.getOwner() !== player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: territory.getId(),
                owner: territory.getOwner().getId()
            });
        }

        const availableUnits = getAvailableUnits();

        if (availableUnits >= units && availableUnits - units > -1) {
            unitsPlaced += units;

            territory.addUnits(units);

            emit(GAME_EVENTS.DEPLOY_UNITS, {
                playerId: player.getId(),
                territoryId: territory.getId(),
                units: units
            });
        } else {
            throw createError(ERRORS.NoUnitsError);
        }
    }

    function nextPhase () {
        if (player.getCards().length > 4) {
            throw createError(ERRORS.RequireCardRedeemError, {
                cards: player.getCards()
            });
        }

        const availableUnits = getAvailableUnits();

        if (availableUnits !== 0) {
            throw createError(ERRORS.RequireDeployError, {
                units: availableUnits
            });
        }

        emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
            playerId: player.getId(),
            phase: nextTurnPhase
        });

        emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, player.getId(), {});
    }

    return Object.freeze({
        setPlayer,
        deployUnits,
        nextPhase,
        redeemCards
    });
}

module.expors = { create: PlacementPhase };


