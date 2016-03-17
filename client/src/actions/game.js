export function changeTurn() {
    return dispatch => {
        setTimeout(() => {
            dispatch({
                id: 0,
                name: 'player1'
            });
        }, 200);
    }
}
