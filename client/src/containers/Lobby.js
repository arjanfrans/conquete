import React, { Component, PropTypes } from 'react';

class Lobby extends Component {
    static propTypes = {
        lobby: PropTypes.object.isRequired
    };

    render() {
        const clients = this.props.lobby.get('clients');

        const clientItems = [];

        for (let [id, client] of clients) {
            clientItems.push(<li key={ id }>{ id } - { client.name }</li>);
        }

        return (
            <div>
                <h2>Player lobby</h2>
                <ul>
                    { clientItems }
                </ul>
            </div>
        );
    }
}

export default Lobby;
