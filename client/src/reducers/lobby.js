import Types from '../actions/Types';

const initialState = {
    me: null,
    isLoggedIn: false,
    currentRoom: null,
    clients: [
        { id: '234', name: 'yoo' }
    ],
    rooms: []
};

export default function lobby(state = initialState, action) {
    switch (action.type) {
        case Types.REGISTER:
            return Object.assign({}, state, {
                isLoggedIn: true,
                me: {
                    id: action.id,
                    name: action.name
                }
            });
        case Types.ADD_CLIENT:
            return Object.assign({}, state, {
                clients: [
                    ...state.clients,
                    action.client
                ]
            });
        case Types.ADD_ROOM:
            return Object.assign({}, state, {
                rooms: [
                    ...state.rooms,
                    action.room
                ]
            });
        case Types.JOIN_ROOM: {
            let currentRoom = state.currentRoom;

            const rooms = state.rooms.map(room => {
                let client = room.clients.indexOf(action.client);
                let clients = room.clients.slice();

                if (room.name === action.room.name && !room.clients.includes(action.client)) {
                    clients.push(action.client);
                }

                if (room.name === action.room.name) {
                    currentRoom = room;
                }

                return Object.assign({}, room, {
                    clients: clients
                });
            });

            return Object.assign({}, state, {
                rooms: rooms,
                currentRoom: currentRoom
            });
        }
        case Types.LEAVE_ROOM: {
            const rooms = state.rooms.filter(room => {
                console.log(room)
                if (room.name === action.room.name) {
                    return false;
                }

                return true;
            });

            return Object.assign({}, state, {
                rooms: rooms,
                currentRoom: action.room.name === state.currentRoom.name ? null : state.currentRoom
            });
        }
        default:
            return state
    }
};
