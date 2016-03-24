import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import game from './game';
import lobby from './lobby';
import errors from './errors';

const rootReducer = combineReducers({
    form: formReducer,
    game,
    lobby,
    errors
});

export default rootReducer;
