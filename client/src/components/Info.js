import React, { Component, PropTypes } from 'react';
import Player from './Player';

class Info extends Component {
    static propTypes = {
        game: PropTypes.object.isRequired
    };

    render() {
        let turn = this.props.game.get('turn');

        return (
            <div>
                <ul>
                    <li>player to turn: { turn ? turn.name : '?' }</li>
                </ul>
            </div>
        );
    }
}

export default Info;
