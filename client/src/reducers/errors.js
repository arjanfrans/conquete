import Immutable from 'immutable';
import { TYPES } from '../actions';

const initialState = Immutable.Map();

export default function game(state = initialState, action) {
    switch (action.type) {
        case TYPES.PUSH_FLASH:
            return state.set(action.id, {
                level: action.level,
                message: action.message
            });
        case TYPES.REMOVE_FLASH:
            return state.delete(action.id);
        default:
            return state
    }
};
