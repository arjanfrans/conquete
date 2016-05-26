'use strict';

function State ({ cardQueue, cards, players, playerQueue, board, phase, turn }) {
    let turnCount = 0;
    let previousTurnEvent = null;
    let previousPlayerEvent = null;

    function setTurnCount (value) {
        turnCount = value;
    }

    function increaseTurnCount () {
        turnCount += 1;
    }

    function setPreviousPlayerEvent (value) {
        previousPlayerEvent = value;
    }

    function setPreviousTurnEvent (value) {
        previousTurnEvent = value;
    }

    function getPreviousTurnEvent () {
        return previousTurnEvent;
    }

    function getPreviousPlayerEvent () {
        return previousPlayerEvent;
    }

    function getCardQueue () {
        return cardQueue;
    }

    function getCards () {
        return cards.slice(0);
    }

    function getPlayers () {
        return players;
    }

    function getPlayerQueue () {
        return playerQueue;
    }

    function getBoard () {
        return board;
    }

    function getPhase () {
        return phase;
    }

    function setPhase (value) {
        phase = value;
    }

    function getTurn () {
        return turn;
    }

    function toJSON () {
        return {
            turnCount,
            phase,
            previousTurnEvent,
            previousPlayerEvent,
            turn: {
                movements: [...turn.movements].map(move => {
                    const rawMove = {
                        from: move[1].from.id,
                        to: move[1].to.id,
                        units: move[1].units
                    };

                    return [move[0], rawMove];
                }),
                phase: turn.phase,
                player: turn.player.getId(),
                unitsPlaced: turn.unitsPlaced,
                cardBonus: turn.cardBonus,
                battle: turn.battle ? turn.battle.toJSON() : null,
                wonBattle: turn.wonBattle
            },
            cards: cards,
            cardQueue: cardQueue.getItems(),
            players: Array.from(players.values()).map(player => {
                return player.toJSON();
            }),
            playerQueue: playerQueue.getItems().map(player => player.getId()),
            board: board.toJSON()
        };
    }

    return Object.freeze({
        getTurn,
        getPhase,
        getPlayers,
        setPreviousPlayerEvent,
        setPreviousTurnEvent,
        getPreviousPlayerEvent,
        getPreviousTurnEvent,
        setTurnCount,
        getPlayerQueue,
        setPhase,
        getBoard,
        getCards,
        getCardQueue,
        increaseTurnCount,
        toJSON
    });
}

module.exports = { create: require('./protect-object')(State) };
