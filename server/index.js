'use strict';

const debug = require('debug')('risk/server:index');
const SocketServer = require('socket.io');
const PORT = 8080;
const io = new SocketServer();
const Room = require('./Room');
const uuid = require('node-uuid');

const clients = new Map();
const rooms = new Map();

function error (socket, ...data) {
    io.to(socket.id).emit('error', ...data);
}

io.on('connection', socket => {
    let client = null;

    debug('socket connected', { socketId: socket.id });

    socket.on('register', data => {
        client = {
            id: uuid.v1(),
            name: data.name,
            socket: socket,
            inRoom: null
        };

        clients.set(socket.id, client);

        socket.emit('ready', {
            client: {
                id: client.id,
                name: client.name
            },
            rooms: Array.from(rooms.values()).map(room => room.toJSON())
        });

        debug('client registered', client.name)
    });

    socket.on('create_room', data => {
        try {
            let room = new Room(data.name, data.maxPlayers, client, io);

            rooms.set(room.name, room);

            client.inRoom = room;

            debug('room created', client.id, room.toJSON());

            socket.emit('created_room', {
                room: room.toJSON()
            });

        } catch (err) {
            error(socket, {
                error: 'error creating room'
            });

            debug('error creating room', err.stack);
        }
    });

    socket.on('room_info', data => {
        let room = rooms.get(data.name);

        if (room) {
            socket.emit('info', room.toJSON());
        }
    });

    socket.on('join_room', data => {
        try {
            let room = rooms.get(data.name);

            room.join(client);

            debug('client joined room', room.name, client.id);

            socket.emit('joined_room', {
                room: room.toJSON(),
                client: {
                    id: client.id,
                    name: client.name
                }
            })
        } catch (err) {
            error(socket, { error: 'error joining room' });

            debug('error joining room', err.stack);
        }
    });

    socket.on('leave', data => {
        if (client.inRoom) {
            debug('client leaving room', client);

            // If owner, remove the room
            if (client.inRoom.owner === client) {
                rooms.delete(client.inRoom.name);
            }

            client.inRoom.leave(client);
            client.inRoom = null;
        } else {
            error(socket, {
                error: 'not in room'
            });
        }
    });

    socket.on('start', data => {
        try {
            if (client.inRoom) {
                client.inRoom.start(client);
            } else {
                throw Error('Not in a room');
            }
        } catch (err) {
            error(socket, {
                error: 'error starting game'
            });

            debug('error starting game', err.stack);
        }
    });

    socket.on('disconnect', () => {
        debug('socket disconnected', { sockedId: socket.id });
    });

    socket.on('error', err => {
        console.log('global error', err ? err.stack : err);
    });
});


io.listen(PORT);
debug('server started', PORT);
