export default function SocketDispatcher(socket, actions) {
    const { lobby } = actions;

    socket.on('connect', () => {
    });

    socket.on('ready', data => {
        lobby.register(data);
    });

    socket.on('created_room', data => {
        console.log(data);
        lobby.addRoom(data.room);
    })
}
