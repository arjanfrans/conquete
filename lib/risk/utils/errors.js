'use strict';

const ERRORS = {
    TurnError: {
        name: 'TurnError',
        message: data => `It is not your turn. Turn is to player "${data.turn}".`
    },
    NoBattleError: {
        name: 'NoBattleError',
        message: 'No battle in progress.'
    },
    BattleTurnError: {
        name: 'BattleTurnError',
        message: data => `It is not your turn in the current battle. Turn is to player "${data.battleTurn}".`
    },
    GameEndedError: {
        name: 'GameEndedError',
        message: 'Game has ended.'
    },
    PhaseActionError: {
        name: 'PhaseActionError',
        message: data => `Action is not allowed in game phase "${data.phase}".`
    },
    TurnPhaseActionError: {
        name: 'TurnPhaseActionError',
        message: data => `Action is not allowed in game phase "${data.phase}" and turn phase "${data.turnPhase}".`
    },
    InvalidTerritoryError: {
        name: 'InvalidTerritoryError',
        message: data => `Territory "${data.territoryId}" is invalid.`
    },
    InvalidPlayerError: {
        name: 'InvalidPlayerError',
        message: data => `Player "${data.playerId}" is invalid.`
    },
    TerritoryClaimedError: {
        name: 'TerritoryClaimedError',
        message: data => `Territory "${data.territoryId}" is already claimed by player "${data.owner}".`
    },
    NotOwnTerritoryError: {
        name: 'NotOwnTerritoryError',
        message: data => `Territory "${data.territoryId}" is not yours. The owner is player "${data.owner}".`
    },
    MoveOwnTerritoriesError: {
        name: 'MoveOwnTerritoriesError',
        message: data => `You can only move units between your own territories. Territories ${data.territoryIds.map(id => `"${id}"`).join(', ')} are not yours.`
    },
    TerritoriesAdjacentError: {
        name: 'TerritoriesAdjacentError',
        message: data => `Territories ${data.territoryIds.map(id => `"${id}"`).join(', ')} are not adjacent.`
    },
    NoStartingUnitsError: {
        name: 'NoStartingUnitsError',
        message: 'You have no more starting units left.'
    },
    NoUnitsErrors: {
        name: 'NoUnitsErrors',
        message: 'You have no more units available.'
    },
    InvalidDiceError: {
        name: 'InvalidDiceError',
        message: data => `Number of dice "${data.dice}" is invalid.`
    },
    InvalidUnitsError: {
        name: 'InvalidUnitsError',
        message: data => `Number of units "${data.units}" is invalid.`
    },
    NumberOfCardsErrors: {
        name: 'NumberOfCardsErrors',
        message: 'You must redeem 3 cards.'
    },
    NotOwnCardsError: {
        name: 'NotOwnCardsError',
        message: data => `You do not have these cards: ${data.cards.map(card => `"${card}"`).join(', ')}.`
    },
    AlreadyInBattleError: {
        name: 'AlreadyInBattleError',
        message: 'You are already in a battle. You can not attack while in a battke.'
    },
    AttackSelfError: {
        name: 'AttackSelfError',
        message: data => `You can not attack your self. Territory "${data.territoryId}" is your own.`
    },
    LeaveOneUnitError: {
        name: 'LeaveOneUnitError',
        message: 'Leave at least 1 unit behind.'
    },
    NotInBattleError: {
        name: 'NotInBattleError',
        message: 'You are not in a battle. You can not roll dice while not in battle.'
    },
    RequireDeployError: {
        name: 'RequireDeployError',
        message: data => `You must deploy your units first. You have "${data.units}" units left to deploy.`
    },
    RequireCardRedeemError: {
        name: 'RequireCardRedeemError',
        message: data => `You must redeem cards until you have less than 5. Your cards: ${data.cards.map(card => `"${card}"`).join(', ')}.`
    }
};

function createError (errorDefinition, data) {
    let message = null;

    if (typeof errorDefinition.message === 'function') {
        message = errorDefinition.message(data);
    } else {
        message = errorDefinition.message;
    }

    const err = new Error(message);

    err.name = errorDefinition.name;
    err.data = data || {};

    return err;
}

module.exports = {
    createError,
    ERRORS
};
