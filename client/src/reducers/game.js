import Immutable from 'immutable';

const initialState = Immutable.Map({
    turn: null,
    phase: null
});

export default function game(state = initialState, action) {
    switch (action.type) {
        case 'turn_change':
            return state.set('turn', action.player);
        case 'phase_change':
            return state.set('phase', action.phase);
        default:
            return state
    }
};
