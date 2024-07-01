'use client';

import { FunctionComponent } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const getZoomLevel = (accuracyRadius?: number) => {
  if (!accuracyRadius || accuracyRadius > 500) {
    // Continent level zoon
    return 2;
  }
  if (accuracyRadius > 100) {
    // Country level zoom
    return 5;
  }
  // City level zoom
  return 9;
};

// This is a workaround for the marker icon not showing up out of the box
const DefaultIcon = L.divIcon({
  html: `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="15" fill="#FF5D22" opacity="0.5"/>
          <circle cx="15" cy="15" r="7" fill="#FF5D22"/>
        </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  // Necessary to prevent default border and background of .leaflet-div-icon
  className: 'playground-map-marker',
});
L.Marker.prototype.options.icon = DefaultIcon;

type MapProps = {
  position: [number, number];
  height?: string;
  width?: string;
  zoom?: number;
};

const Map: FunctionComponent<MapProps> = (props) => {
  const defaultZoom = 9; // Shows you rougly inside a specific city
  return (
    <MapContainer
      center={props.position}
      zoom={props.zoom ?? defaultZoom}
      style={{
        height: props.height ?? '200px',
        width: props.width ?? '100%',
        borderRadius: '4px',
        border: '1px solid #E8E8E8',
      }}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      {/* More options here https://github.com/leaflet-extras/leaflet-providers 
      but make sure to test them live, some of them only work on Localhost  */}
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <Marker position={props.position} icon={DefaultIcon} interactive={false} />
    </MapContainer>
  );
};

export default Map;
