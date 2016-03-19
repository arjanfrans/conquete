import { combineReducers } from 'redux-immutable';
import game from './game';
import lobby from './lobby';
import errors from './errors';

const rootReducer = combineReducers({
    game,
    lobby,
    errors
});

export default rootReducer;
