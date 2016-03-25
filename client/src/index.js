import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import Actions from './actions';

import { configureStore } from './store';
import App from './containers/App';
import nestedActionCreators from './utils/nestedActionCreators';

import SocketDispatcher from './socket-dispatcher';
import SocketIO from 'socket.io-client';
import SocketTypes from './actions/SocketTypes';

const socket = SocketIO('http://localhost:8080');
const store = configureStore({
    socket: socket,
    socketActionTypes: SocketTypes
});


ReactDOM.render(
    <Provider store={ store }>
        <App />
    </Provider>,
    document.getElementById('root')
);

SocketDispatcher(socket, nestedActionCreators(Actions, store.dispatch));
