import React, { Component, PropTypes } from 'react';

class Room extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        clients: PropTypes.array.isRequired
    };

    render() {
        const clients = this.props.clients.map((client, index) => {
            return (
                <li key={ index } >
                    { client.name }
                </li>
            );
        });

        return (
            <div>
                <h3>{ this.props.name }</h3>
                <ul>
                    { clients }
                </ul>
            </div>
        );
    }
}

export default Room;
