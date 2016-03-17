export default function logger(store) {
    return (next) => (action) => {
        let result;

        console.group('state change');
        console.info('dispatching', action);

        result = next(action);

        console.log('next state', store.getState().toJS());
        console.groupEnd(action.name);

        return result;
    };
};
