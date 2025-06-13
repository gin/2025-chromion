import React from 'react';
import { Marker } from 'react-native-maps';
import { calculateDistance } from '@/utils/geo';
import { GolfShot } from '@/models/GolfShot';

interface ShotMarkerProps {
  shot: GolfShot;
  index: number;
  nextShot?: GolfShot;
  totalShots: number;
  onDeleteShot?: (shotId: string) => void;
  onPress?: () => void;
  onCalloutPress?: () => void;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({
  shot,
  index,
  nextShot,
  totalShots,
  onDeleteShot,
  onPress,
  onCalloutPress,
}) => {
  const showDistance = nextShot && nextShot.holeNumber === shot.holeNumber;
  const isFirstShotOfHole = shot.shotNumber === 1;
  const isLastShotOfRound = index === totalShots - 1;

  const handlePress = () => {
    onPress?.();
  };

  const handleCalloutPress = () => {
    onCalloutPress?.();
  };

  return (
    <Marker
      key={shot.id}
      coordinate={shot.coordinate}
      title={`Hole ${shot.holeNumber} - Shot ${shot.shotNumber}`}
      description={`Club: ${shot.club ? shot.club : 'Not entered'} ${
        showDistance ? ` | Distance: ${Math.round(
          calculateDistance(shot.coordinate, nextShot.coordinate) * 1.09361
        )} yards` : ''
      }`}
      pinColor={isFirstShotOfHole ? 'green' : isLastShotOfRound ? 'red' : 'orange'}
      onPress={handlePress}
      onCalloutPress={handleCalloutPress}
      onDeselect={handleCalloutPress}
    />
  );
};

export default ShotMarker;
