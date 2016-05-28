'use strict';

const ERRORS = require('../../errors');
const createError = require('strict-errors').createError;
const Battle = require('../../Battle');

const events = require('../../events');
const GAME_EVENTS = events.GAME_EVENTS;
const PLAYER_EVENTS = events.PLAYER_EVENTS;

function AttackPhase ({ emit, players, playerQueue, cardManager }) {
    let battle = null;
    let player = null;
    const nextTurnPhase = 'fortifying';
    let wonBattle = false;

    function setPlayer (value) {
        player = value;
    }

    function isGameOver () {
        const playerCount = Array.from(players.values()).filter(player => !player.isDead()).length;

        return playerCount === 1;
    }

    function attack (fromTerritory, toTerritory, units) {
        if (battle) {
            throw createError(ERRORS.AlreadyInBattleError);
        }

        if (Number.isNaN(units) || units < 1) {
            throw createError(ERRORS.InvalidUnitsEror, { units });
        }

        if (fromTerritory.getOwner() !== player) {
            throw createError(ERRORS.NotOwnTerritoryError, {
                territoryId: fromTerritory.getId(),
                owner: fromTerritory.getOwner().getId()
            });
        }

        if (toTerritory.getOwner() === player) {
            throw createError(ERRORS.AttackSelfError, {
                territoryId: toTerritory.getId()
            });
        }

        if (units > fromTerritory.getUnits() - 1) {
            throw createError(ERRORS.LeaveOneUnitError);
        }

        battle = Battle.create({
            from: fromTerritory,
            to: toTerritory,
            units
        });

        emit(GAME_EVENTS.ATTACK, {
            from: fromTerritory.getId(),
            to: toTerritory.getId(),
            attacker: player.getId(),
            defender: toTerritory.getOwner().getId(),
            units: units
        });

        emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, player.getId(), {
            type: 'attacker',
            maxDice: Math.min(3, battle.getAttackUnits())
        });
    }

    function getWinner () {
        const remainingPlayers = Array.from(players.values()).filter(player => !player.isDead());

        if (remainingPlayers.length === 1) {
            return remainingPlayers[0];
        }

        return null;
    }

    function endGame () {
        emit(GAME_EVENTS.GAME_END, {
            winner: getWinner().getId()
        });
    }

    function killPlayer (killer, killed) {
        playerQueue.remove(killed);

        // Get cards from the killed player
        const takenCards = [];

        for (const card of killed.getCards()) {
            killer.addCard(card);
            killed.removeCard(card);
            takenCards.push(card);

            emit(PLAYER_EVENTS.NEW_CARD, killer.getId(), {
                card: card
            });
        }

        emit(GAME_EVENTS.PLAYER_DEFEATED, {
            defeatedBy: killer.getId(),
            playerId: killed.getId(),
            numberOfCardsTaken: takenCards.length
        });
    }

    function endBattle () {
        if (battle.hasEnded()) {
            emit(GAME_EVENTS.BATTLE_END, {
                type: battle.getWinner() === battle.getAttacker() ? 'attacker' : 'defender',
                winner: battle.hasEnded() ? battle.getWinner().getId() : null,
            });

            if (battle.getWinner() === player) {
                wonBattle = true;

                if (battle.getDefender().isDead()) {
                    killPlayer(battle.getAttacker(), battle.getDefender());
                }
            }

            battle = null;

            if (isGameOver()) {
                endGame();
            } else {
                emit(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, player.getId(), {});
            }
        }
    }

    function rollDice (numberOfDice) {
        if (Number.isNaN(numberOfDice) || numberOfDice < 1) {
            throw createError(ERRORS.InvalidDiceError, { dice: numberOfDice });
        }

        if (battle.getAttacker() === battle.getTurn()) {
            const playerId = battle.getTurn().getId();
            const dice = battle.attackThrow(numberOfDice);

            emit(GAME_EVENTS.ATTACK_DICE_ROLL, { playerId, dice });

            if (!battle.hasEnded()) {
                emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.getDefender().getId(), {
                    type: 'defender',
                    maxDice: Math.min(2, battle.getDefendUnits())
                });
            } else {
                endBattle();
            }
        } else if (battle.getDefender() === battle.getTurn()) {
            const playerId = battle.getTurn().getId();
            const defendResults = battle.defendThrow(numberOfDice);

            emit(GAME_EVENTS.DEFEND_DICE_ROLL, {
                dice: defendResults.dice,
                results: defendResults.results,
                playerId: playerId
            });

            if (!battle.hasEnded()) {
                emit(PLAYER_EVENTS.REQUIRE_DICE_ROLL, battle.getAttacker().getId(), {
                    type: 'attacker',
                    maxDice: Math.min(3, battle.getAttackUnits()),
                });
            } else {
                endBattle();
            }
        } else {
            throw createError(ERRORS.NotInBattleError);
        }
    }
    function grabCard () {
        const card = cardManager.popCard();

        player.addCard(card);

        emit(PLAYER_EVENTS.NEW_CARD, player.getId(), {
            card: card
        });
    }

    function endPhase (nextPlayer) {
        if (wonBattle) {
            grabCard();
        }

        emit(GAME_EVENTS.TURN_PHASE_CHANGE, {
            playerId: nextPlayer.getId(),
            phase: nextTurnPhase
        });
    }

    return Object.freeze({
        attack,
        rollDice,
        endPhase,
        setPlayer
    });
}

module.exports = { create: AttackPhase };
