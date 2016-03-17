import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Actions from '../actions';

import Board from '../components/Board';
import Info from '../components/Info';
import DevTools from './DevTools';

class App extends Component {
    static PropTypes = {
        actions: PropTypes.object.isRequired,
        game: PropTypes.object.isRequired
    };

    render() {
        return (
            <div>
                <h1>Risk on maps</h1>
                <Board />
                <Info game={ this.props.game } />
                   <DevTools />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        game: state.get('game')
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
