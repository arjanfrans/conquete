import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Actions from '../actions';
import DevTools from './DevTools';

import Game from './Game';
import Lobby from './Lobby';
import Flash from '../components/Flash';

class App extends Component {
    static PropTypes = {
        actions: PropTypes.object.isRequired,
        game: PropTypes.object.isRequired,
        errors: PropTypes.object.isRequired,
        lobby: PropTypes.object.isRequired
    };

    render() {
        const errors = this.props.errors.map((error, index) => {
            return (
                <Flash
                    key={ index }
                    level={ error.level }
                    message={ error.message }
                />
            );
        });

        return (
            <div>
                <h1>Risk on maps</h1>
                <Game game={ this.props.game } />
                { errors.size > 0 ? errors : null }
                <Lobby
                    lobby={ this.props.lobby }
                    actions={ this.props.actions }
                />
                <DevTools />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        errors: state.get('errors'),
        game: state.get('game'),
        lobby: state.get('lobby')
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
