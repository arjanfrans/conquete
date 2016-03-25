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
            currentRoom: null,
            showCreateRoom: false
        };
    }

    handleRegistration(data) {
        this.props.actions.server.register('sdasd' + data.name);
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
        const { isLoggedIn, rooms } = this.props.lobby;
        const currentRoom = this.state.currentRoom ? <Room { ...this.state.currentRoom } /> : null;

        let createRoomForm = null;

        if (this.state.showCreateRoom) {
            createRoomForm = <CreateRoomForm onSubmit={ ::this.onCreateRoomSubmit } />;
        }

        const registrationForm = !isLoggedIn ? <RegistrationForm onSubmit={ ::this.handleRegistration } /> : null;

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
                { registrationForm }
                { currentRoom }
            </div>
        );
    }
}

export default Lobby;
