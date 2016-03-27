import Types from '../actions/Types';

const initialState = {
    me: null,
    isLoggedIn: false,
    currentRoom: null,
    clients: [
        { id: '234', name: 'yoo' }
    ],
    rooms: [
        {
            id: '1',
            name: 'room1',
            maxPlayers: 3,
            clients: []
        },
        {
            id: '2',
            name: 'room2',
            maxPlayers: 4,
            clients: []
        }

    ]
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
        case Types.JOIN_ROOM:
            let currentRoom = state.currentRoom;
            const rooms = state.rooms.map(room => {
                if (room.name === action.room.name) {
                    if (!room.clients.includes(action.client.name)) {
                        return Object.assign({}, room, {
                            clients: [
                                ...room.clients,
                                action.client.name
                            ]
                        })
                    }

                    currentRoom = room;
                }

                return room;
            });

            return Object.assign({}, state, {
                rooms: rooms,
                currentRoom: currentRoom
            });
        default:
            return state
    }
};
