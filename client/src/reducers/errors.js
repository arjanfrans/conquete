import Immutable from 'immutable';
import Types from '../actions/Types';

const initialState = Immutable.Map();

export default function game(state = initialState, action) {
    switch (action.type) {
        case Types.PUSH_FLASH:
            return state.set(action.id, {
                id: action.id,
                level: action.level,
                message: action.message
            });
        case Types.REMOVE_FLASH:
            return state.delete(action.id);
        default:
            return state
    }
};
