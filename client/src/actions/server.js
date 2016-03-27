import Types from './SocketTypes';

export function createRoom(name, maxPlayers) {
    return {
        type: Types.CREATE_ROOM,
        data: {
            name,
            maxPlayers
        }
    }
}

export function joinRoom(roomName) {
    return {
        type: Types.JOIN_ROOM,
        name: roomName
    };
}

export function register(name) {
    return {
        type: Types.REGISTER,
        data: {
            name: name
        }
    };
}
