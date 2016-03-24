import Types from './SocketTypes';

export function register(name) {
    return {
        type: Types.REGISTER,
        data: {
            name: name
        }
    };
}
