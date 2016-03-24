import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
// import logger from './middleware/logger';
import rootReducer from './reducers';

import DevTools from './containers/DevTools';
import { createSocketMiddleware } from './middleware/socket';

const enhancer = compose(
    DevTools.instrument(),
    persistState(
        window.location.href.match(/[?&]debug_session=([^&#]+)\b/)
    )
);

export function configureStore(socketOptions) {
    const socket = socketOptions.socket;
    const socketActionTypes = socketOptions.socketActionTypes;
    const socketMiddleware = createSocketMiddleware(socket, socketActionTypes);
    const initialState = {};
    const store = applyMiddleware(thunk, socketMiddleware)(createStore)(rootReducer, initialState, enhancer);

    return store;
}
