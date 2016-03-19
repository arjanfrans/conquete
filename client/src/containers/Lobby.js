import React, { Component, PropTypes } from 'react';
import RoomList from '../components/RoomList';
import Room from '../components/Room';

class Lobby extends Component {
    static propTypes = {
        lobby: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            currentRoom: null
        };
    }

    setCurrentRoom(room) {
        if (!this.state.currentRoom) {
            this.setState({
                currentRoom: room
            });
        } else {
            console.log(this.props.actions)
            this.props.actions.errors.pushFlash('error', 'Already in room.');
        }
    }

    render() {
        const rooms = this.props.lobby.get('rooms').toJS();
        const currentRoom = this.state.currentRoom ? <Room { ...this.state.currentRoom } /> : null;

        return (
            <div>
                <h2>Player lobby</h2>
                <RoomList
                    rooms={ rooms }
                    onRoomClick={ ::this.setCurrentRoom }
                />
                { currentRoom }
            </div>
        );
    }
}

export default Lobby;
