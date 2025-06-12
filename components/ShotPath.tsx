import React from 'react';
import { Polyline } from 'react-native-maps';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface GolfShot {
  id: string;
  coordinate: Coordinate;
  holeNumber: number;
  // Other properties not needed
}

interface ShotPathProps {
  coordinates: Coordinate[];
  shots: GolfShot[];
}

const ShotPath: React.FC<ShotPathProps> = ({ coordinates, shots }) => {
  if (coordinates.length < 2) return null;

  // Create path segments based on hole transitions
  const pathSegments: { coordinates: Coordinate[]; isDifferentHole: boolean }[] = [];

  for (let i = 0; i < shots.length - 1; i++) {
    const currentShot = shots[i];
    const nextShot = shots[i + 1];

    pathSegments.push({
      coordinates: [currentShot.coordinate, nextShot.coordinate],
      isDifferentHole: currentShot.holeNumber !== nextShot.holeNumber,
    });
  }

  return (
    <>
      {pathSegments.map((segment, index) => (
        <Polyline
          key={index}
          coordinates={segment.coordinates}
          strokeColor={segment.isDifferentHole ? "rgba(255,255,0,0.6)" : "rgba(255,255,0,0.8)"}
          strokeWidth={4}
          lineDashPattern={segment.isDifferentHole ? [3, 3] : [1]}
          lineCap="round"
          lineJoin="round"
        />
      ))}
    </>
  );
};

export default ShotPath;
