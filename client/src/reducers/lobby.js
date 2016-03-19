import Immutable from 'immutable';
import Types from '../actions/Types';

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
        case Types.ADD_CLIENT:
            return state.update('clients', clients => clients.push(action.client));
       case Types.ADD_ROOM:
            return state.update('rooms', rooms => rooms.push(action.room));
        default:
            return state
    }
};
