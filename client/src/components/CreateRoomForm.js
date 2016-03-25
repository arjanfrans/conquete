import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

export const fields = ['name', 'id', 'maxPlayers'];

class CreateRoomForm extends Component {
    static propTypes = {
        fields: PropTypes.object.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        resetForm: PropTypes.func.isRequired,
        submitting: PropTypes.bool.isRequired
    };

    render() {
        const { fields: { name, maxPlayers, id }, handleSubmit } = this.props;
        const playerOptions = ['3', '4', '5', '6'];

        return (
            <form onSubmit={ handleSubmit }>
                <div>
                    <label>Room name</label>
                    <input type="text" { ...name }/>
                </div>
                <div>
                    <label>id name</label>
                    <input type="text" { ...id }/>
                </div>
                <div>
                    <label>Players</label>
                    <select { ...maxPlayers } >
                        { playerOptions.map(playerOption => {
                            return (
                                <option
                                    value={ playerOption }
                                    key={ playerOption }
                                >
                                    { playerOption }
                                </option>
                            );
                        }) }
                    </select>
                </div>
                <button type="submit">Submit</button>
            </form>
        );
    }
}

export default reduxForm({
    form: 'createRoom',
    fields
})(CreateRoomForm);
