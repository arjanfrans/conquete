import React, { Component, PropTypes } from 'react';

class RoomList extends Component {
    static propTypes = {
        rooms: PropTypes.array.isRequired,
        onRoomClick: PropTypes.func.isRequired
    };

    render() {
        const rooms = this.props.rooms.map((room, index) => {
            return (
                <li key={ index } >
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
