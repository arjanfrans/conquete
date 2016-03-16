import React from 'react';
import { render } from 'react-dom';

import SimpleExample from './components/simple';
import EventsExample from './components/events';
import BoundsExample from './components/bounds';
import VectorLayersExample from './components/vector-layers';
import OtherLayersExample from './components/other-layers';
import ZoomControlExample from './components/zoom-control';
import CustomComponentExample from './components/custom-component';
import AnimateExample from './components/animate';

const examples = (
  <div>
    <h1>React-Leaflet examples</h1>
    <h2>Vector layers</h2>
    <VectorLayersExample />
  </div>
);

render(examples, document.getElementById('root'));
