import { TYPES } from './';

export function addClient(client) {
    return {
        type: TYPES.ADD_CLIENT,
        client: client
    };
}

export function addRoom(room) {
    return {
        type: 'add_room',
        room: room
    };
}
