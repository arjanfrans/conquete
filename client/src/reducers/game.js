import Immutable from 'immutable';

const initialState = Immutable.Map();

export default function game(state = initialState, action) {
    switch (action.type) {
        case 'turn_change':
            return state.set('turn', action.playerId);
        case 'phase_change':
            return state.set('phase', action.phase);
        default:
            return state
    }
};
