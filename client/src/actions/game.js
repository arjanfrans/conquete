import Types from './Types';

export function changeTurn() {
    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: Types.TURN_CHANGE,
                player: {
                    id: 0,
                    name: 'player1'
                }
            });
        }, 200);
    }
}
