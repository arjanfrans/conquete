'use strict';

const Queue = require('./Queue');
const RotatingQueue = require('./RotatingQueue');
const Territory = require('./Territory');
const Continent = require('./Continent');
const Player = require('./Player');
const Board = require('./Board');
const Battle = require('./Battle');

class State {
    constructor (rawState) {
        this.cards = rawState.cards;
        this.cardQueue = new Queue(rawState.cardQueue || this.cards);
        this.players = this._loadPlayers(rawState.players);
        this.board = this._loadBoard(rawState.board);

        this._territoryOwners(rawState.board.territories, rawState.players);

        if (rawState.playerQueue) {
            let rawPlayerQueue = rawState.playerQueue.map(playerId => {
                return this.players.get(playerId);
            });

            this.playerQueue = new RotatingQueue(rawPlayerQueue);
        } else {
            this.playerQueue = new RotatingQueue(Array.from(this.players.values()));
        }

        this.phase = rawState.phase;
        this.turn = this._loadTurn(rawState.turn);
    }

    _loadTurn (rawTurn) {
        let player = rawTurn.player !== null ? this.players.get(rawTurn.player) : null;
        let battle = null;

        if (rawTurn.battle) {
            let from = this.board.territories.get(rawTurn.battle.from);
            let to = this.board.territories.get(rawTurn.battle.to);

            battle = new Battle(from, to, rawTurn.battle.initialAttackUnits);

            battle.attackUnits = rawTurn.battle.attackUnits;
            battle.defendUnits = rawTurn.battle.defendUnits;
            battle.turn = this.players.get(rawTurn.battle.turn);
            battle.attackDice = rawTurn.battle.attackDice || [];
            battle.defendDice = rawTurn.battle.defendDice || [];
            battle.winner = rawTurn.battle.winner || null;
        }

        let turn = {
            movements: new Map(rawTurn.movements.map(rawMove => {
                let move = {
                    from: this.board.territories.get(rawMove[1].from),
                    to: this.board.territories.get(rawMove[1].to),
                    units: rawMove[1].units
                };

                return [rawMove[0], move];
            })),
            phase: rawTurn.phase,
            player: player,
            unitsPlaced: rawTurn.unitsPlaced,
            cardBonus: rawTurn.cardBonus,
            battle: battle,
            wonBattle: rawTurn.wonBattle
        };

        return turn;
    }

    _territoryOwners (rawTerritories, rawPlayers) {
        for (let rawTerritory of rawTerritories) {
            for (let rawPlayer of rawPlayers) {
                if (rawPlayer.territoryIds && rawPlayer.territoryIds.includes(rawTerritory.id)) {
                    let territory = this.board.territories.get(rawTerritory.id);
                    let player = this.players.get(rawPlayer.id);

                    territory.setOwner(player, rawTerritory.units);
                    player.territories.add(territory);
                }
            }
        }
    }

    _loadBoard (rawBoard) {
        let territories = new Map();
        let continents = new Map();

        for (let rawContinent of rawBoard.continents) {
            let continent = new Continent(rawContinent.id, rawContinent.name, rawContinent.bonus);

            continents.set(continent.id, continent);
        }

        for (let rawTerritory of rawBoard.territories) {
            let territory = new Territory(rawTerritory.id, rawTerritory.name);

            territories.set(territory.id, territory);

            let continent = continents.get(rawTerritory.continentId);

            if (!continent) {
                throw new Error('Invalid continent id for territory: ' + rawTerritory.id);
            }

            territory.continent = continent;

            continent.addTerritory(territory);
        };

        for (let rawTerritory of rawBoard.territories) {
            let territory = territories.get(rawTerritory.id);

            rawTerritory.adjacentTerritoryIds.forEach(id => {
                let adjacentTerritory = territories.get(id);

                if (!adjacentTerritory) {
                    throw new Error('Invalid adjacent territory id: ' + id);
                }

                territory.addAdjacentTerritory(adjacentTerritory);
            });
        };

        let board = new Board(territories, continents);

        return board;
    }

    _loadPlayers (rawPlayers) {
        let players = new Map();

        rawPlayers.map((rawPlayer, index) => {
            let player = new Player(rawPlayer.id || index, rawPlayer.name);

            player.startUnits = rawPlayer.startUnits || player.startUnits;
            player.dead = rawPlayer.dead || player.dead;

            if (rawPlayer.cards) {
                rawPlayer.cards.forEach(card => player.addCard(card));
            }

            players.set(player.id, player);
        });

        return players;
    }

    toJSON () {
        let json = {
            phase: this.phase,
            turn: {
                movements: [...this.turn.movements].map(move => {
                    let rawMove = {
                        from: move[1].from.id,
                        to: move[1].to.id,
                        units: move[1].units
                    };

                    return [move[0], rawMove];
                }),
                phase: this.turn.phase,
                player: this.turn.player.id,
                unitsPlaced: this.turn.unitsPlaced,
                cardBonus: this.turn.cardBonus,
                battle: this.turn.battle ? this.turn.battle.toJSON() : null,
                wonBattle: this.turn.wonBattle
            },
            cards: this.cards,
            cardQueue: this.cardQueue.items,
            players: Array.from(this.players.values()).map(player => {
                return player.toJSON();
            }),
            playerQueue: this.playerQueue.items.map(player => player.id),
            board: this.board.toJSON()
        }

        return json;
    }
}

module.exports = State;
