import React, { Component, PropTypes } from 'react';

class RoomList extends Component {
    static propTypes = {
        rooms: PropTypes.array.isRequired,
        onRoomClick: PropTypes.func.isRequired
    };

    render() {
        let rooms = this.props.rooms.map(room => {
            return (
                <li key={ room.id } >
                    <a onClick={ this.props.onRoomClick.bind(this, room) }>
                        { room.name }
                    </a>
                </li>
            );
        });

        return (
            <div>
                <ul>
                    { rooms }
                </ul>
            </div>
        );
    }
}

export default RoomList;
