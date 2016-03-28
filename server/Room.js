'use strict';

const uuid = require('node-uuid');
const GameFactory = require('./game-factory');
const Risk = require('../lib/risk/index');
const debug = require('debug')('risk/server:Room');

class Room {
    constructor (name, maxPlayers, client, io) {
        this.id = uuid.v1();
        this.name = name;
        this.owner = client;
        this.clients = new Map();
        this.maxPlayers = maxPlayers;
        this.clients.set(client.id, client);
        this.io = io;
        this.started = false;
        this.game = null;
    }

    start (client) {
        if (client !== this.owner) {
            throw new Error('You can not start the game');
        }

        let options = GameFactory.classic();
        let players = [];

        for (let client of this.clients.values()) {
            players.push({
                name: client.name,
                events: this.io.to(client.socket.id)
            });
        }

        options.players = players;

        this.game = Risk(this.io.to(this.name), options, null);

        if (this.game) {
            this.started = true;
            this.game.start();

            debug('game started');
        } else {
            throw new Error('Unable to start game');
        }
    };

    join (client) {
        if (!this.started) {
            this.clients.set(client.id, client);
            client.socket.join(this.name);
        } else {
            throw new Error('Game started');
        }
    }

    leave (client) {
        this.clients.delete(client.id);
    }

    emit (eventName, ...data) {
        for (let client of this.clients.values()) {
            client.socket.emit(eventName, ...data);
        }
    }

    toJSON () {
        return {
            id: this.id,
            name: this.name,
            maxPlayers: this.maxPlayers,
            clients: Array.from(this.clients.values()).map(client => {
                return client.name;
            })
        };
    }
}

module.exports = Room;
