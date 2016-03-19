import React, { Component, PropTypes } from 'react';

class Flash extends Component {
    static propTypes = {
        level: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired
    };

    render() {
        return (
            <div>
                { this.props.level } - { this.props.message }
            </div>
        );
    }
}

export default Flash;
