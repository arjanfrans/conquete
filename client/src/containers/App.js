import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Actions from '../actions';

import Board from '../components/Board';

class App extends Component {
    static PropTypes = {
        actions: PropTypes.object.isRequired
    };

    render() {
        return (
            <div>
                <h1>Risk on maps</h1>
                <Board />
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log(state.toObject());
    return {
        game: state.get('turn'),
        phase: state.get('phase')
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
