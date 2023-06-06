import { FunctionComponent } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserPreferences } from '../../api/personalization/use-user-preferences';

// This is a workaround for the marker icon not showing up out of the box
let DefaultIcon = L.icon({
  iconUrl: 'marker-icon.png',
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
  const { hasDarkMode } = useUserPreferences();
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
      <TileLayer
        // default maps: url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        url={`https://tiles.stadiamaps.com/tiles/alidade_smooth${hasDarkMode ? '_dark' : ''}/{z}/{x}/{y}{r}.png`}
      />
      <Marker position={props.position} icon={DefaultIcon} interactive={false} />
    </MapContainer>
  );
};

export default Map;
