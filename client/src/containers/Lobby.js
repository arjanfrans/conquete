import React, { Component, PropTypes } from 'react';
import RoomList from '../components/RoomList';
import Room from '../components/Room';
import CreateRoomForm from '../components/CreateRoomForm';

class Lobby extends Component {
    static propTypes = {
        lobby: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            currentRoom: null,
            showCreateRoom: false
        };
    }

    setCurrentRoom(room) {
        if (!this.state.currentRoom) {
            this.setState({
                currentRoom: room
            });
        } else {
            this.props.actions.errors.pushFlash('error', 'Already in room.');
        }
    }

    showCreateRoom() {
        this.setState({
            showCreateRoom: true
        });
    }

    onCreateRoomSubmit(data) {
        this.props.actions.lobby.addRoom({
            ...data
        });

        this.setState({ showCreateRoom: false });
    }

    render() {
        const rooms = this.props.lobby.rooms;
        const currentRoom = this.state.currentRoom ? <Room { ...this.state.currentRoom } /> : null;

        let createRoomForm = null;

        if (this.state.showCreateRoom) {
            createRoomForm = <CreateRoomForm onSubmit={ ::this.onCreateRoomSubmit } />;
        }

        return (
            <div>
                <h2>Player lobby</h2>
                <button onClick={ ::this.showCreateRoom } >
                    Create room
                </button>
                { createRoomForm }
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
