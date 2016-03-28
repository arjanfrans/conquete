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
        case Types.JOIN_ROOM:
            let currentRoom = state.currentRoom;
            const rooms = state.rooms.map(room => {
                if (room.name === action.room.name) {
                    let newRoom = Object.assign({}, room, {
                        clients: [
                            ...room.clients,
                            action.client
                        ]
                    });

                    currentRoom = newRoom;

                    return newRoom;
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
