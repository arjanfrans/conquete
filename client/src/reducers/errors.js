import Types from '../actions/Types';

const initialState = [];

export default function game(state = initialState, action) {
    switch (action.type) {
        case Types.PUSH_FLASH:
            return [
                ...state,
                {
                    id: action.id,
                    level: action.level,
                    message: action.message
                }
            ];
        case Types.REMOVE_FLASH:
            return state.filter(flash => flash.id !== action.id);
        default:
            return state
    }
};
