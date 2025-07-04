import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Coordinate } from '@/types/geo.types';
import { calculateDistance } from '@/utils/geo';

interface CenterDotProps {
  lastShotCoordinate?: Coordinate | null;
  gpsCoordinate?: Coordinate | null;
  centerCoordinate: Coordinate;
}

const CenterDot: React.FC<CenterDotProps> = ({
  lastShotCoordinate,
  gpsCoordinate,
  centerCoordinate,
}) => {
  const getDistance = () => {
    if (!centerCoordinate) return null;

    if (lastShotCoordinate) {
      const distance = calculateDistance(centerCoordinate, lastShotCoordinate);
      return `${Math.round(distance * 1.09361)} yards`; // Convert meters to yards
    }

    if (gpsCoordinate) {
      const distance = calculateDistance(centerCoordinate, gpsCoordinate);
      return `${Math.round(distance * 1.09361)} yards from GPS`;
    }

    return null;
  };

  const distance = getDistance();

  return (
    <View style={styles.container}>
      {distance && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      )}
      <View style={styles.dot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 0, 0.8)',
    borderWidth: 2,
    borderColor: '#000',
    marginLeft: -6, // Half of width to center
    marginTop: -6,  // Half of height to center
  },
  distanceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderRadius: 4,
    position: 'absolute',
    bottom: 20,
    width: 'auto',
    minWidth: 80,
    alignItems: 'center',
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CenterDot;
