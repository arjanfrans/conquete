import React from 'react';
import { render } from 'react-dom';

import Board from './components/Board';

const examples = (
  <div>
    <h1>Risk on maps</h1>
    <Board />
  </div>
);

render(examples, document.getElementById('root'));
