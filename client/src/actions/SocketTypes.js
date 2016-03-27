const types = {
    REGISTER: 'register',
    CREATE_ROOM: 'create_room',
    JOIN_ROOM: 'join_room'
};

Object.keys(types).forEach(typeKey => {
    types[typeKey] = 'socket_' + types[typeKey]
});

export default types;


