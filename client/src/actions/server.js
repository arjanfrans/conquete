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
        data: {
            name: roomName
        }
    };
}

export function leaveRoom() {
    return {
        type: Types.LEAVE_ROOM,
        data: {}
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
