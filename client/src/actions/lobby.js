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
        room: {
            id: room.id,
            name: room.name,
            clients: room.clients,
            maxPlayers: room.maxPlayers
        }
    };
}

export function register(client) {
    return {
        type: Types.REGISTER,
        id: client.id,
        name: client.name
    };
}
