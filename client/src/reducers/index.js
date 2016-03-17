import { combineReducers } from 'redux-immutable';
import game from './game';

const rootReducer = combineReducers({
    game
});

export default rootReducer;
