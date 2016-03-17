export function changeTurn() {
    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: 'turn_change',
                player: {
                    id: 0,
                    name: 'player1'
                }
            });
        }, 200);
    }
}
