'use strict';

export function createSocketMiddleware(socket, socketActionTypes) {
    return function socketMiddleware(store) {
        return next => action => {
            const types = Object.keys(socketActionTypes).map(typeKey => {
                return socketActionTypes[typeKey];
            });

            if (types.includes(action.type)) {
                const eventName = action.type.split('_')[1];

                socket.emit(eventName, action.data);
            }

            return next(action);
        };
    };
};
