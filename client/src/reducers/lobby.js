import Immutable from 'immutable';

const initialState = Immutable.Map({
    rooms: {},
    clients: Immutable.Map({
        '234': { id: '234', name: 'yoo' }
    })
});

export default function lobby(state = initialState, action) {
    switch (action.type) {
        case 'add_client':
            return state.setIn(['clients', action.client.id], action.client);
        default:
            return state
    }
};
