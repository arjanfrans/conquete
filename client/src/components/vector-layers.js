import React, { Component } from 'react';
import gju from 'geojson-utils';
import {
  Circle,
  CircleMarker,
  Map,
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
import territories from '../territories.json';

export default class VectorLayersExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            startId: null,
            endId: null
        };
    }

    onPopupClick(territory) {
        if (!this.state.startId) {
            this.setState({ startId: popup.id });
        } else {
            if (!this.state.endId) {
                this.setState({ endId: popup.id });
            }
        }
        console.log(this.state)
    }

  render() {
    const center = [46.795552489122535, 103.16632486331058];
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

    return (
      <Map center={center} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        <GeoJson data={ territories } />
        { markers }
      </Map>
    );
  }
}
