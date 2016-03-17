import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import Immutable from 'immutable';
import logger from './middleware/logger';
import rootReducer from './reducers';

import DevTools from './containers/DevTools';

const enhancer = compose(
    DevTools.instrument(),
    persistState(
        window.location.href.match(/[?&]debug_session=([^&#]+)\b/)
    )
);

const state = Immutable.Map({});

const store = applyMiddleware(thunk, logger)(createStore)(rootReducer, state, enhancer);

export default store;
