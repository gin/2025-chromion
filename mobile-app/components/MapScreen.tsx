import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { loadLastLocationFromStorage } from '@/services/storageService';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useShotManagement } from '@/hooks/useShotManagement';
import { Coordinate } from '@/types/geo.types';
import { GolfShot } from '@/models/GolfShot';

import HoleSelector from './HoleSelector';
import ClubSelector from './ClubSelector';
import ShotMarker from './ShotMarker';
import ShotPath from './ShotPath';
import ClearDataButton from './ClearDataButton';
import CenterDot from './CenterDot';
import GPSQualityIndicator from './GPSQualityIndicator';
import ShotEditor from './ShotEditor';

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
    deleteShot,
    clearShots,
    getLastShot,
    getLastShotDistance,
    updateShots,
  } = useShotManagement();
  
  const [mapCenter, setMapCenter] = useState<Coordinate | null>(null);
  const [showClubSelector, setShowClubSelector] = useState(false);
  const [pendingShot, setPendingShot] = useState<Coordinate | null>(null);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [dotToggle, setDotToggle] = useState(true);
  const [showShotEditor, setShowShotEditor] = useState(false);
  const [selectedShotData, setSelectedShotData] = useState<GolfShot | null>(null);
  const [clubSelectionMode, setClubSelectionMode] = useState<'record' | 'add' | 'edit'>('record');
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [showPreviousHoles, setShowPreviousHoles] = useState(true);
  
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
      setClubSelectionMode('record');
      setShowClubSelector(true);
    } catch (error) {
      console.error('Error getting map center:', error);
      Alert.alert('Error', 'Could not get map center. Please try again.');
    }
  };

  const handleRequestClubSelection = useCallback((mode: 'add' | 'edit', shotId?: string, location?: Coordinate) => {
    console.log('handleRequestClubSelection called:', { mode, shotId, location });

    // Close the ShotEditor first to prevent multiple triggers
    setShowShotEditor(false);
    setSelectedShotData(null);

    if (mode === 'add' && location) {
      // TODO: Reorder shots by hole or let user define shot order
      // Batch state updates for add mode
      setPendingShot(location);
      setEditingShotId(null);
      setClubSelectionMode('add');
      setShowClubSelector(true);
      console.log('Set up for add mode');
    } else if (mode === 'edit' && shotId) {
      // Batch state updates for edit mode
      setPendingShot(null);
      setEditingShotId(shotId);
      setClubSelectionMode('edit');
      setShowClubSelector(true);
      console.log('Set up for edit mode:', { shotId });
    }
  }, []);

  const handleClubSelect = useCallback((club: string) => {
    console.log('handleClubSelect called:', { club, clubSelectionMode, pendingShot, editingShotId });

    // Prevent multiple rapid calls by immediately hiding the club selector
    setShowClubSelector(false);

    if (clubSelectionMode === 'record' && pendingShot) {
      console.log('Processing record mode');
      createShot({ ...pendingShot, accuracy: 1 }, club);
      centerMapOnLocation(pendingShot.latitude, pendingShot.longitude);
    } else if (clubSelectionMode === 'add' && pendingShot) {
      console.log('Processing add mode');
      createShot({ ...pendingShot, accuracy: 1 }, club);
      centerMapOnLocation(pendingShot.latitude, pendingShot.longitude);
    } else if (clubSelectionMode === 'edit' && editingShotId) {
      console.log('Processing edit mode:', { editingShotId, club });
      handleEditClub(editingShotId, club);
    } else {
      console.log('No matching condition:', { clubSelectionMode, pendingShot, editingShotId });
    }

    // Clean up all state in one batch
    console.log('Cleaning up club selector state');
    setClubSelectionMode('record');
    setPendingShot(null);
    setEditingShotId(null);
  }, [clubSelectionMode, pendingShot, editingShotId, createShot, updateShots]);

  const handleMarkerPress = useCallback((shotId: string) => {
    const shot = shots.find(s => s.id === shotId);
    if (shot) {
      setSelectedShotData(shot);
      setShowShotEditor(true);
    }
  }, [shots]);

  const handleMarkerCalloutPress = useCallback(() => {
    // Also allow callout press to open editor
    if (selectedShotData) {
      setShowShotEditor(true);
    }
  }, [selectedShotData]);

  const handleMarkerDeselect = useCallback(() => {
    setSelectedShotData(null);
    setIsCalloutVisible(false);
  }, []);

  const handleMapPress = () => {
    // When user taps the map, deselect any selected marker and hide callout
    setSelectedShotData(null);
    setIsCalloutVisible(false);
  };
  
  const handleCenterMap = () => {
    if (userLocation) {
      centerMapOnLocation(userLocation.latitude, userLocation.longitude);
    }
  };
  
  const handleDotToggle = () => {
    if (dotToggle) setDotToggle(false);
    if (!dotToggle) setDotToggle(true);
  };

  const handlePreviousHolesToggle = () => {
    setShowPreviousHoles(!showPreviousHoles);
  };

  const handleEditClub = (shotId: string, club: string) => {
    // Find the shot and update its club
    const updatedShots = shots.map(shot =>
      shot.id === shotId ? { ...shot, club } : shot
    );
    updateShots(updatedShots);
  };

  const handleEditLocation = (shotId: string, location: Coordinate) => {
    const updatedShots = shots.map(shot =>
      shot.id === shotId ? { ...shot, coordinate: location } : shot
    );
    updateShots(updatedShots);
  };

  // Pre-compute shot markers data to avoid expensive operations during render
  const shotMarkersData = useMemo(() => {
    // Filter shots based on toggle state: always show current hole, conditionally show previous holes
    const filteredShots = showPreviousHoles
      ? shots
      : shots.filter(shot => shot.holeNumber === currentHole);

    return filteredShots.map((shot) => {
      // Find next shot in the same hole for distance calculation
      const nextShotInHole = shots.find(s =>
        s.holeNumber === shot.holeNumber &&
        s.shotNumber === shot.shotNumber + 1
      );

      return {
        shot,
        nextShotCoordinate: nextShotInHole?.coordinate,
        key: shot.id,
        onPress: () => handleMarkerPress(shot.id), // Pre-create the callback
      };
    });
  }, [shots, showPreviousHoles, currentHole, handleMarkerPress]);

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
        onPress={handleMapPress}
      >
        {shotMarkersData.map(({ shot, nextShotCoordinate, key, onPress }) => (
          <ShotMarker
            key={key}
            shot={shot}
            nextShotCoordinate={nextShotCoordinate}
            onPress={onPress}
            onCalloutPress={handleMarkerCalloutPress}
            onDeselect={handleMarkerDeselect}
          />
        ))}
        <ShotPath shots={showPreviousHoles ? shots : shots.filter(shot => shot.holeNumber === currentHole)} />
      </MapView>

      { dotToggle && mapCenter && !isCalloutVisible && (
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

        {/* GPS Quality Indicator */}
        <GPSQualityIndicator
          accuracy={userLocation?.accuracy ?? null}
          isAcquiring={!userLocation || (userLocation.accuracy > 10)}
        />

        <View style={styles.buttonContainer}>
          {/* Centering Map button */}
          <TouchableOpacity
            style={[
              styles.centerMapButton,
              !userLocation && styles.centerMapButtonDisabled
            ]}
            onPress={handleCenterMap}
            disabled={!userLocation}
          >
            <Text style={styles.centerMapButtonText}>🌎</Text>
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

          {/* Previous Holes Toggle button */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !showPreviousHoles && styles.toggleButtonDisabled
            ]}
            onPress={handlePreviousHolesToggle}
          >
            <Text style={styles.toggleButtonText}>
              {showPreviousHoles ? '📍' : '🕳️'}
            </Text>
          </TouchableOpacity>

          {/* Dot Toggle button */}
          <TouchableOpacity
            style={styles.dotToggleButton}
            onPress={handleDotToggle}
          >
            <Text style={styles.dotToggleButtonText}>🤖</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ShotEditor
        visible={showShotEditor}
        onClose={() => {
          setShowShotEditor(false);
          setSelectedShotData(null);
          setIsCalloutVisible(false);
        }}
        selectedShot={selectedShotData}
        mapCenter={mapCenter}
        onDeleteShot={deleteShot}
        onEditLocation={handleEditLocation}
        onRequestClubSelection={handleRequestClubSelection}
      />

      <ClubSelector
        visible={showClubSelector}
        onSelectClub={handleClubSelect}
        onCancel={() => {
          console.log('ClubSelector cancelled');
          setPendingShot(null);
          setEditingShotId(null);
          setClubSelectionMode('record');
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
    bottom: 60,
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
  centerMapButton: {
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
  centerMapButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerMapButtonText: {},
  dotToggleButton: {
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
  dotToggleButtonText: {},
  toggleButton: {
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
  toggleButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleButtonText: {
    fontSize: 20,
  },
});

export default MapScreen;
