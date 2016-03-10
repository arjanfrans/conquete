'use strict';

const socket = require('socket.io-client')('http://localhost:3000');
const argv = require('minimist')(process.argv.slice(2));
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
const debug = require('debug')('risk/client:index');

function write (...data) {
    console.log(...data);
}

rl.prompt();

rl.on('line', line => {
    try {
        let output = commandParser(line);

        if (typeof output !== 'undefined') {
            write(output);
        }

        rl.prompt();
    } catch (err) {
        rl.prompt();
        console.log(err.stack);
    }
}).on('close', () => {
    process.exit(0);
});

function commandParser (rawInput) {
    let input = rawInput.split(' ');
    let command = input.shift();
    let args = input;

    switch (command) {
        case 'create': {
            socket.emit('create', {
                name: args[0]
            });
            break;
        }
        case 'start': {
            socket.emit('start', {});
            break;
        }
        case 'join': {
            socket.emit('join', {
                name: args[0]
            });
            break;
        }
        case 'room': {
            socket.emit('room_info', {
                name: args[0]
            });
            break;
        }
        case 'leave': {
            socket.emit('leave', {});
            break;
        }
    }
}

socket.on('connect', () => {
    debug('connected to server');

    socket.emit('register', {
        name: argv.name
    });

    socket.on('ready', () => {
        listen(socket);
    });
});

socket.on('error', err => {
    debug('error', err);
});

socket.on('disconnect', () => {
    debug('disconnected from server');
});

function listen(socket) {
    socket.on('created_room', room => {
        debug('created room', room);
    });

    socket.on('joined_room', room => {
        debug('joined room', room);
    });

    socket.on('info', data => {
        write(data)
    });
}
