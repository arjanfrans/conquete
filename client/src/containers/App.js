import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Actions from '../actions';
import DevTools from './DevTools';

import Game from './Game';
import Lobby from './Lobby';

class App extends Component {
    static PropTypes = {
        actions: PropTypes.object.isRequired,
        game: PropTypes.object.isRequired,
        lobby: PropTypes.object.isRequired
    };

    render() {
        return (
            <div>
                <h1>Risk on maps</h1>
                <Game game={ this.props.game } />
                <Lobby lobby={ this.props.lobby } />
                <DevTools />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
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
