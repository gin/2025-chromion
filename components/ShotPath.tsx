import React from 'react';
import { Polyline } from 'react-native-maps';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface ShotPathProps {
  coordinates: Coordinate[];
}

const ShotPath: React.FC<ShotPathProps> = ({ coordinates }) => {
  if (coordinates.length < 2) return null;

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor="#FF0000"
      strokeWidth={3}
      lineDashPattern={[5, 10]}
    />
  );
};

export default ShotPath;
