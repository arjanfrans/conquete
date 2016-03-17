export function addClient(client) {
    return {
        type: 'add_client',
        client: client
    };
}
