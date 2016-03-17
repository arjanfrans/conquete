import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import Immutable from 'immutable';
import logger from './middleware/logger';
import rootReducer from './reducers';

const state = Immutable.Map({});
const store = applyMiddleware(thunk, logger)(createStore)(rootReducer, state);

export default store;
