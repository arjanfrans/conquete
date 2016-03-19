import Immutable from 'immutable';
import { TYPES } from '../actions';

const initialState = Immutable.fromJS({
    clients: [
        { id: '234', name: 'yoo' }
    ],
    rooms: [
        {
            id: '1',
            name: 'room1',
            clients: []
        },
        {
            id: '2',
            name: 'room2',
            clients: []
        }

    ]
});

export default function lobby(state = initialState, action) {
    switch (action.type) {
        case TYPES.ADD_CLIENT:
            return state.update('clients', clients => clients.push(action.client));
       case TYPES.ADD_ROOM:
            return state.update('rooms', rooms => rooms.push(action.room));
        default:
            return state
    }
};
