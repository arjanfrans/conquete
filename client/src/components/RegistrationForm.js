import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

export const fields = ['name'];

class RegistrationForm extends Component {
    static propTypes = {
        fields: PropTypes.object.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        resetForm: PropTypes.func.isRequired,
        submitting: PropTypes.bool.isRequired
    };

    render() {
        const { fields: { name }, handleSubmit } = this.props;

        return (
            <form onSubmit={ handleSubmit }>
                <div>
                    <label>Name</label>
                    <input type="text" { ...name }/>
                </div>
                <button type="submit">Submit</button>
            </form>
        );
    }
}

export default reduxForm({
    form: 'registeration',
    fields
})(RegistrationForm);
