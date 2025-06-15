import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { loadLastLocationFromStorage } from '@/services/storageService';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useShotManagement } from '@/hooks/useShotManagement';
import { Coordinate } from '@/types/geo.types';

import HoleSelector from './HoleSelector';
import ClubSelector from './ClubSelector';
import ShotMarker from './ShotMarker';
import ShotPath from './ShotPath';
import ClearDataButton from './ClearDataButton';
import CenterDot from './CenterDot';
import GPSQualityIndicator from './GPSQualityIndicator';

// A golf course for map to center on if user's phone has no GPS.
const DEFAULT_INITIAL_REGION = {
  latitude: 33.66745,
  longitude: -117.9298,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MapScreen: React.FC = () => {
  const { userLocation } = useLocationTracking();
  const {
    shots,
    currentHole,
    setCurrentHole,
    createShot,
    // deleteShot, // Commented out - not currently used in UI
    clearShots,
    getLastShot,
    getLastShotDistance,
  } = useShotManagement();
  
  const [mapCenter, setMapCenter] = useState<Coordinate | null>(null);
  const [showClubSelector, setShowClubSelector] = useState(false);
  const [pendingShot, setPendingShot] = useState<Coordinate | null>(null);
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  
  const mapRef = useRef<MapView>(null);

  const centerMapOnLocation = (latitude: number, longitude: number, zoom = 0.001) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: zoom,
      longitudeDelta: zoom,
    }, 1000);
  };
  
  // Effect for initial map centering
  useEffect(() => {
    const setInitialMapPosition = async () => {
      // 1. Try to center on the user's current GPS location
      if (userLocation) {
        centerMapOnLocation(userLocation.latitude, userLocation.longitude);
        return;
      }
      // 2. If no GPS, try the last known location from storage
      const lastLocation = await loadLastLocationFromStorage();
      if (lastLocation) {
        centerMapOnLocation(lastLocation.latitude, lastLocation.longitude);
        return;
      }
      // 3. Fallback to a default location
      // The initialRegion on the MapView handles this.
    };

    setInitialMapPosition();
  }, [userLocation]); // Re-center only when the first userLocation is found

  const handleRecordShot = async () => {
    if (!mapRef.current) return;
    try {
      const camera = await mapRef.current.getCamera();
      setPendingShot(camera.center);
      setShowClubSelector(true);
    } catch (error) {
      console.error('Error getting map center:', error);
      Alert.alert('Error', 'Could not get map center. Please try again.');
    }
  };

  const handleClubSelect = (club: string) => {
    if (pendingShot) {
      createShot({ ...pendingShot, accuracy: 1 }, club);
      centerMapOnLocation(pendingShot.latitude, pendingShot.longitude);
    }
    setPendingShot(null);
    setShowClubSelector(false);
  };

  const handleMarkerPress = (shotId: string) => {
    setSelectedShot(current => (current === shotId ? null : shotId));
  };
  
  const handleCenterMap = () => {
      if (userLocation) {
        centerMapOnLocation(userLocation.latitude, userLocation.longitude);
      }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        mapType="satellite"
        initialRegion={DEFAULT_INITIAL_REGION}
        showsUserLocation
        showsCompass
        showsScale
        onRegionChangeComplete={async (region) => setMapCenter(region)}
      >
        {shots.map((shot) => {
          // Find next shot in the same hole for distance calculation
          const nextShotInHole = shots.find(s =>
            s.holeNumber === shot.holeNumber &&
            s.shotNumber === shot.shotNumber + 1
          );

          return (
            <ShotMarker
              key={shot.id}
              shot={shot}
              nextShotCoordinate={nextShotInHole?.coordinate}
              onPress={() => handleMarkerPress(shot.id)}
            />
          );
        })}
        <ShotPath shots={shots} />
      </MapView>

      {mapCenter && !selectedShot && (
        <CenterDot
          centerCoordinate={mapCenter}
          lastShotCoordinate={getLastShot()?.coordinate}
          gpsCoordinate={userLocation}
        />
      )}

      <ClearDataButton onClear={clearShots} />

      <HoleSelector
        currentHole={currentHole}
        onHoleChange={setCurrentHole}
        shots={shots}
      />

      <View style={styles.controlsContainer}>
        {/*
          TODO: AI caddie to suggest which club to use based on
          distance
          and user's historical data
          and weather
          and course
          and other golfer's data
        */}
        {getLastShotDistance() && (
          <View style={styles.statusContainer}>
            <Text style={styles.distanceText}>
              Last: {getLastShotDistance()}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {/* GPS Centering button */}
          <TouchableOpacity
            style={[
              styles.centerButton,
              !userLocation && styles.centerButtonDisabled
            ]}
            onPress={handleCenterMap}
            disabled={!userLocation}
          >
            <Text style={styles.centerButtonText}>🌎</Text>
          </TouchableOpacity>

          {/* Record button */}
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleRecordShot}
          >
            <Text style={styles.recordButtonText}>
              RECORD SHOT
            </Text>
          </TouchableOpacity>

          {/* GPS Quality Indicator */}
          <GPSQualityIndicator
            accuracy={userLocation?.accuracy ?? null}
            isAcquiring={!userLocation || (userLocation.accuracy > 10)}
          />
        </View>
      </View>

      <ClubSelector
        visible={showClubSelector}
        onSelectClub={handleClubSelect}
        onCancel={() => {
          setPendingShot(null);
          setShowClubSelector(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' },
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

export default MapScreen;
