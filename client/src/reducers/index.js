import { combineReducers } from 'redux-immutable';
import game from './game';
import lobby from './lobby';

const rootReducer = combineReducers({
    game,
    lobby
});

export default rootReducer;
