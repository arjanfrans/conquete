export default function SocketDispatcher(socket, actions) {
    socket.on('connect', () => {
        console.log('connected');
    })
}
