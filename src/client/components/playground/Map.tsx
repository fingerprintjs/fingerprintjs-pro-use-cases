import { FunctionComponent } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This is a workaround for the marker icon not showing up out of the box
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type MapProps = {
  position: [number, number];
  height?: string;
  width?: string;
};

const Map: FunctionComponent<MapProps> = (props) => {
  return (
    <MapContainer
      center={props.position}
      zoom={10}
      style={{ height: props.height ?? '200px', width: props.width ?? '100%' }}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <Marker position={props.position} icon={DefaultIcon} interactive={false} />
    </MapContainer>
  );
};

export default Map;
