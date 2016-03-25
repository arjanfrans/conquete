export default function SocketDispatcher(socket, actions) {
    const { lobby } = actions;

    socket.on('connect', () => {
    });

    socket.on('ready', data => {
        lobby.register(data);
    });
}
