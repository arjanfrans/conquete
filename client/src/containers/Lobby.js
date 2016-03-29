import React, { Component, PropTypes } from 'react';
import RoomList from '../components/RoomList';
import Room from '../components/Room';
import CreateRoomForm from '../components/CreateRoomForm';
import RegistrationForm from '../components/RegistrationForm';

class Lobby extends Component {
    static propTypes = {
        lobby: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            showCreateRoom: false
        };
    }

    handleRegistration(data) {
        this.props.actions.server.register(data.name);
    }

    handleJoinRoom(room) {
        if (!this.props.lobby.currentRoom) {
            this.props.actions.server.joinRoom(room.name);
        } else {
            this.props.actions.errors.pushFlash('error', 'Already in room.');
        }
    }

    showCreateRoom() {
        this.setState({
            showCreateRoom: true
        });
    }

    handleCreateRoom(data) {
        this.props.actions.server.createRoom(data.name, data.maxPlayers);

        this.setState({ showCreateRoom: false });
    }

    handleLeaveRoom() {
        this.props.actions.server.leaveRoom();
    }

    render() {
        const { isLoggedIn, rooms } = this.props.lobby;
        console.log(this.props.lobby.currentRoom)
        const currentRoom = this.props.lobby.currentRoom ? <Room { ...this.props.lobby.currentRoom } /> : null;

        let createRoomForm = null;

        if (this.state.showCreateRoom) {
            createRoomForm = <CreateRoomForm onSubmit={ ::this.handleCreateRoom } />;
        }

        const registrationForm = !isLoggedIn ? <RegistrationForm onSubmit={ ::this.handleRegistration } /> : null;

        let createRoomButton = null;
        let leaveRoomButton = null;

        if (!this.props.lobby.currentRoom) {
            createRoomButton = (
                <button onClick={ ::this.showCreateRoom } >
                    Create room
                </button>
            );
        } else {
            leaveRoomButton = (
                <button onClick={ ::this.handleLeaveRoom } >
                    Leave room
                </button>
            );
        }

        const lobby = (
            <div>
                <h2>Player lobby</h2>
                { createRoomButton }
                { createRoomForm }
                { leaveRoomButton }
                <RoomList
                    rooms={ rooms }
                    onRoomClick={ ::this.handleJoinRoom }
                />
                { currentRoom }
            </div>
        );

        return (
            <div>
                { isLoggedIn ? lobby : registrationForm }
            </div>
        );
    }
}

export default Lobby;
