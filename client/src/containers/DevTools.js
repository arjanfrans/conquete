import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import FilterMonitor from 'redux-devtools-filter-actions';
import DockMonitor from 'redux-devtools-dock-monitor';
import Dispatcher from 'redux-devtools-dispatch';
import MultipleMonitors from 'redux-devtools-multiple-monitors';
import Actions from '../actions';

export default createDevTools(
    <DockMonitor toggleVisibilityKey='ctrl-h' changePositionKey='ctrl-q'>
        <MultipleMonitors>
            <FilterMonitor blacklist={['^redux-form*']}>
                <LogMonitor />
            </FilterMonitor>
            <Dispatcher actionCreators={ Actions } />
        </MultipleMonitors>
    </DockMonitor>
);
