import React, { Component, PropTypes } from 'react';

class Flash extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        level: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        removeFlashAction: PropTypes.func.isRequired
    };

    componentDidMount() {
        setTimeout(() => {
            this.props.removeFlashAction(this.props.id);
        }, 2000);
    }

    render() {
        return (
            <div>
                { this.props.level } - { this.props.message }
            </div>
        );
    }
}

export default Flash;
