import React from 'react';
import { Marker } from 'react-native-maps';

interface GolfShot {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  shotNumber: number;
  holeNumber: number;
  club: string | null;
}

interface ShotMarkerProps {
  shot: GolfShot;
  index: number;
  nextShot?: GolfShot;
  totalShots: number;
  calculateDistance: (shot1: GolfShot, shot2: GolfShot) => number;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({
  shot,
  index,
  nextShot,
  totalShots,
  calculateDistance,
}) => {
  const showDistance = nextShot && nextShot.holeNumber === shot.holeNumber;
  const isFirstShotOfHole = shot.shotNumber === 1;
  const isLastShotOfRound = index === totalShots - 1;

  return (
    <Marker
      key={shot.id}
      coordinate={shot.coordinate}
      title={`Hole ${shot.holeNumber} - Shot ${shot.shotNumber}`}
      description={`Club: ${shot.club ? shot.club : 'Not entered'} ${
        showDistance ? ` | Distance: ${Math.round(
          calculateDistance(shot, nextShot) * 1.09361
        )} yards` : ''
      }`}
      pinColor={isFirstShotOfHole ? 'green' : isLastShotOfRound ? 'red' : 'orange'}
    />
  );
};

export default ShotMarker;
