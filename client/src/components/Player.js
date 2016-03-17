import React, { Component, PropTypes } from 'react';

class Player extends Component {
    static propTypes = {
        player: PropTypes.object.isRequired
    }

    render() {
        let player = this.props.player;

        return (
            <h3>{ player.id } - { player.name }</h3>
        );
    }
}

export default Player;
