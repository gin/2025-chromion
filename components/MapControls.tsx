import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import GPSQualityIndicator from './GPSQualityIndicator';

interface MapControlsProps {
  onRecordShot: () => void;
  onCenter: () => void;
  isRecordEnabled: boolean;
  isCenterEnabled: boolean;
  lastShotDistance: string | null;
  accuracy: number | null;
  isAcquiring: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onRecordShot,
  onCenter,
  isRecordEnabled,
  isCenterEnabled,
  lastShotDistance,
  accuracy,
  isAcquiring,
}) => {
  return (
    <View style={styles.controlsContainer}>
      {lastShotDistance && (
        <View style={styles.statusContainer}>
          <Text style={styles.distanceText}>
            Last: {lastShotDistance}
          </Text>
        </View>
      )}


      <View style={styles.buttonContainer}>
        {/* GPS Centering button */}
        <TouchableOpacity
          style={[
            styles.centerButton,
            !isCenterEnabled && styles.centerButtonDisabled
          ]}
          onPress={onCenter}
          disabled={!isCenterEnabled}
        >
          <Text style={styles.centerButtonText}>🌎</Text>
        </TouchableOpacity>


        {/* Record button */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            !isRecordEnabled && styles.recordButtonDisabled
          ]}
          onPress={onRecordShot}
          disabled={!isRecordEnabled}
        >
          <Text style={styles.recordButtonText}>
            RECORD SHOT
          </Text>
        </TouchableOpacity>


        {/* GPS Quality Indicator */}
        <GPSQualityIndicator
          accuracy={accuracy}
          isAcquiring={isAcquiring}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  distanceText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
    paddingHorizontal: 42,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  recordButtonDisabled: {
    backgroundColor: 'rgba(204, 204, 204, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  centerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerButtonText: {},
});

export default MapControls;
