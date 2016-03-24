const initialState = {
    turn: null,
    phase: null
};

export default function game(state = initialState, action) {
    switch (action.type) {
        case 'turn_change':
            return Object.assign({}, state, {
                turn: action.player
            });
        case 'phase_change':
            return Object.assign({}, state, {
                phase: action.phase
            });
        default:
            return state
    }
};
