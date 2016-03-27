export default function SocketDispatcher(socket, actions) {
    const { lobby } = actions;

    socket.on('connect', () => {
    });

    socket.on('ready', data => {
        lobby.register(data.client);

        for (let room of data.rooms) {
            lobby.addRoom(room);
        }
    });

    socket.on('created_room', data => {
        lobby.addRoom(data.room);

        for (let client of data.room.clients) {
            lobby.joinRoom(data.room.name, client);
        }
    });
}
