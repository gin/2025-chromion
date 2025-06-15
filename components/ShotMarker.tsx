import React from 'react';
import { Marker } from 'react-native-maps';
import { calculateDistance } from '@/utils/geo';
import { GolfShot } from '@/models/GolfShot';

interface ShotMarkerProps {
  shot: GolfShot;
  nextShotCoordinate?: { latitude: number; longitude: number };
  onPress?: () => void;
  onCalloutPress?: () => void;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({
  shot,
  nextShotCoordinate,
  onPress,
  onCalloutPress,
}) => {
  const showDistance = !!nextShotCoordinate;
  const isFirstShotOfHole = shot.shotNumber === 1;

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
          calculateDistance(shot.coordinate, nextShotCoordinate!) * 1.09361
        )} yards` : ''
      }`}
      pinColor={isFirstShotOfHole ? 'green' : 'orange'}
      onPress={handlePress}
      onCalloutPress={handleCalloutPress}
      onDeselect={handleCalloutPress}
    />
  );
};

export default ShotMarker;
