import React, { Component } from 'react';
import gju from 'geojson-utils';
import {
  Circle,
  CircleMarker,
  Map as LMap,
  MultiPolygon,
  MultiPolyline,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
  GeoJson,
  Marker,
  TileLayer,
} from 'react-leaflet';
import territories from '../data/territories.json';

const mappedTerritories = new Map(territories.features.map(territory => {
    let point = gju.centroid(territory.geometry);
    let position = [point.coordinates[1], point.coordinates[0]];

    return [territory.id, {
        id: territory.id,
        center: position
    }];
}));

const AFRICA = ['egypt', 'congo', 'south_africa'];

export default class VectorLayersExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            startId: null,
            endId: null
        };
    }

    onPopupClick(territory) {
        if (this.state.startId && this.state.endId) {
            this.setState({
                endId: null,
                startId: null
            });
        }

        if (!this.state.startId) {
            this.setState({ startId: territory });
        } else {
            this.setState({ endId: territory });
        }
    }

  render() {
    const center = [46.795552489122535, 103.16632486331058];
    const zoom = 3;
    const polygon = [
        [51.515, -0.09],
        [51.52, -0.1],
        [51.52, -0.12],
    ];

    const markers = territories.features.map(territory => {
        let point = gju.centroid(territory.geometry);
        let position = [point.coordinates[1], point.coordinates[0]];

       return (
          <Marker onLeafletPopupopen={ this.onPopupClick.bind(this, territory.id) } key={ territory.id } color="red" position={ position } >
              <Popup ref={ `territory-${territory.id}` }>
                <span>{ territory.id }</span>
              </Popup>
          </Marker>
      );
    });

    let line = null;

    if (this.state.startId && this.state.endId) {
        let startPoint = mappedTerritories.get(this.state.startId).center;
        let endPoint = mappedTerritories.get(this.state.endId).center;

        line = (<Polyline color="red" positions={ [startPoint, endPoint] } >
                    <Popup>
                        <span>yoooooooooooooo</span>
                    </Popup>
                </Polyline>);
    }

    return (
      <div>
          <LMap center={center} zoom={ zoom }>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
            <GeoJson data={ territories } style={ feature => AFRICA.includes(feature.id) ? { color: 'brown' } : { color: 'blue' } } />
            { markers }
            { line }
          </LMap>
            <div>
                { this.state.startId && this.state.endId ? `Attack from ${this.state.startId} to ${this.state.endId}` : null }
            </div>
        </div>
    );
  }
}
