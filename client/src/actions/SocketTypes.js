const types = {
    REGISTER: 'register',
};

Object.keys(types).forEach(typeKey => {
    types[typeKey] = 'socket_' + types[typeKey]
});

export default types;


