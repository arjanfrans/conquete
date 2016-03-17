import React, { Component, PropTypes } from 'react';
import Board from '../components/Board';
import Info from '../components/Info';

class Game extends Component {
    static propTypes = {
        game: PropTypes.object.isRequired
    };

    render() {
        return (
            <div>
                <Board />
                <Info game={ this.props.game } />
            </div>
        );
    }
}

export default Game;


