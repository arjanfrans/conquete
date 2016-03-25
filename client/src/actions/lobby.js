import Types from './Types';

export function addClient(client) {
    return {
        type: Types.ADD_CLIENT,
        client: client
    };
}

export function addRoom(room) {
    return {
        type: Types.ADD_ROOM,
        room: room
    };
}

export function register(data) {
    return {
        type: Types.REGISTER,
        id: data.id,
        name: data.name
    };
}
