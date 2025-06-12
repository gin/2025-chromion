import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapControls from './MapControls';
import HoleSelector from './HoleSelector';
import ClubSelector from './ClubSelector';
import ShotMarker from './ShotMarker';
import ShotPath from './ShotPath';
import ClearDataButton from './ClearDataButton';
import CenterDot from './CenterDot';

interface GolfShot {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  shotNumber: number;
  holeNumber: number;
  club: string | null; // option for when adding feature to speed up putts
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [mapCenter, setMapCenter] = useState<Coordinate | null>(null);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 33.66745,
    longitude: -117.9298,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [shots, setShots] = useState<GolfShot[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [initialMapLocation, setInitialMapLocation] = useState<UserLocation | null>(null);
  const [showClubSelector, setShowClubSelector] = useState(false);
  const [pendingShot, setPendingShot] = useState<UserLocation | null>(null);
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const handleClearData = async () => {
    setShots([]);
    setCurrentHole(1);
    try {
      await AsyncStorage.multiRemove(['golfShots', 'lastKnownLocation']);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  // Request foreground (during active use) and background (during lock screen, etc) location permissions
  const requestLocationPermission = async () => {
    try {
      const foreground = await Location.requestForegroundPermissionsAsync();
      // if (foreground.status !== 'granted') {
      //   Alert.alert(
      //     'Permission Denied',
      //     'Location permission is required to track your golf shots.'
      //   );
      //   return;
      // }

      const background = await Location.requestBackgroundPermissionsAsync();
      // if (background.status !== 'granted') {
      //   Alert.alert(
      //     'Background Permission Denied',
      //     'Background location permission is recommended for GPS responsiveness.'
      //   );
      // }

      setHasLocationPermission(true);
      startLocationTracking();
    } catch (error) {
      console.log('Permission request error:', error);
    }
  };

  const stopLocationTask = async () => {
    try {
      await Location.stopLocationUpdatesAsync('golf-gps-location');
    } catch (error) {
      console.log('Error stopping location updates:', error);
    }
  };

  const cleanupLocationServices = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    stopLocationTask();
  };

  const handleMapLocationChange = (e: any) => {
    if ((!userLocation || userLocation.accuracy > 1) && e.nativeEvent.coordinate) {
      const mapLocation: UserLocation = {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
        accuracy: e.nativeEvent.coordinate.accuracy || 100, // Default to 100m accuracy
      };
      setInitialMapLocation(mapLocation);
    }
  };

  const centerMapOnLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.001,  // Zoom level
        longitudeDelta: 0.001, // Zoom level
      }, 1000); // Zoom-in animation: 1 second
    }
  };

  const getBestLocation = () => {
    // Intent: Reduce users seeing map init before GPS is ready.
    // Currently using hardcoded initial location of a golf course if GPS is not ready.
    // TODO: alternative is to get last known location from AsyncStorage or last golf course user played.
    return (userLocation && userLocation.accuracy <= 50) ? userLocation : initialMapLocation;
  };

  const saveLastLocation = async (location: UserLocation) => {
    try {
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.log('Error saving location:', error);
    }
  };

  const loadLastLocation = async () => {
    // TODO: or get location of previous golf course user played.
    try {
      const savedLocation = await AsyncStorage.getItem('lastKnownLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        centerMapOnLocation(location.latitude, location.longitude);
      }
    } catch (error) {
      console.log('Error loading location:', error);
    }
  };

  const handleLocationUpdate = (location: Location.LocationObject) => {
    const accuracy = location.coords.accuracy || 100;
    const newLocation: UserLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: accuracy,
    };

    if (!userLocation || accuracy < userLocation.accuracy) {
      setUserLocation(newLocation);
      saveLastLocation(newLocation);
    }
  };

  const startLocationTracking = async () => {
    if (!hasLocationPermission) {
      requestLocationPermission();
      return;
    }

    try {
      await Location.enableNetworkProviderAsync();
      await Location.hasServicesEnabledAsync();
      
      // Intent: Reduce users waiting for map init before GPS is fully ready.
      // Get quick initial location with balanced accuracy
      const quickLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (quickLocation) {
        handleLocationUpdate(quickLocation);
        centerMapOnLocation(quickLocation.coords.latitude, quickLocation.coords.longitude);
      }
      
      // iOS-specific background updates to maintain better GPS accuracy
      // Cost is battery power consumption
      // TODO: increase interval when app is in background to save battery
      if (Platform.OS === 'ios') {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
          await Location.startLocationUpdatesAsync('golf-gps-location', {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500,
            distanceInterval: 0.1,
            activityType: Location.ActivityType.Fitness,
            showsBackgroundLocationIndicator: true,
          });
        }
      }
      
      // Start immediate high-accuracy updates
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500,
          distanceInterval: 0.1,
          mayShowUserSettingsDialog: true,
        },
        handleLocationUpdate
      );

      locationSubscription.current = subscription;

    } catch (error) {
      console.log('Location tracking error:', error);
      Alert.alert(
        'Error',
        'Failed to start location tracking. Please check your device settings.'
      );
    }
  };

  // Record golf shot at the center of the map view because GPS might not be accurate.
  // User adjust the location with the GPS pin for location reference.
  // TODO: add component to calculate center of the map view to last shot.
  const recordShot = async () => {
    if (!mapRef.current) {
      Alert.alert('Error', 'Map is not ready');
      return;
    }

    try {
      const camera = await mapRef.current.getCamera();
      const mapCenterLocation: UserLocation = {
        latitude: camera.center.latitude,
        longitude: camera.center.longitude,
        accuracy: 1, // Using 1m accuracy since this is a manual placement
      };

      setPendingShot(mapCenterLocation);
      setShowClubSelector(true);
    } catch (error) {
      console.log('Error getting map center:', error);
      Alert.alert(
        'Error',
        'Could not record shot at map center. Please try again.'
      );
    }
  };

  const handleClubSelect = (club: string) => {
    if (pendingShot) {
      createShot(pendingShot, club);
      setPendingShot(null);
    }
    setShowClubSelector(false);
  };

  // Save shots to AsyncStorage
  const saveShots = async (newShots: GolfShot[]) => {
    try {
      const shotsData = newShots.map(shot => ({
        ...shot,
        timestamp: shot.timestamp.toISOString(), // Convert Date to string for storage
      }));
      await AsyncStorage.setItem('golfShots', JSON.stringify(shotsData));
    } catch (error) {
      console.log('Error saving shots:', error);
    }
  };

  // Load shots from AsyncStorage
  const loadShots = async () => {
    try {
      const savedShots = await AsyncStorage.getItem('golfShots');
      if (savedShots) {
        const parsedShots = JSON.parse(savedShots);
        // Convert string timestamps back to Date objects
        const shotsWithDates = parsedShots.map((shot: any) => ({
          ...shot,
          timestamp: new Date(shot.timestamp),
        }));
        setShots(shotsWithDates);
      }
    } catch (error) {
      console.log('Error loading shots:', error);
    }
  };

  const createShot = (location: UserLocation, club: string) => {
    const currentHoleShots = shots.filter(shot => shot.holeNumber === currentHole);
    const newShot: GolfShot = {
      id: Date.now().toString(),
      coordinate: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      timestamp: new Date(),
      shotNumber: currentHoleShots.length + 1,  // Shot number for this specific hole
      holeNumber: currentHole,
      club,
    };

    const updatedShots = [...shots, newShot];
    setShots(updatedShots);
    saveShots(updatedShots);
    centerMapOnLocation(location.latitude, location.longitude);
  };

  const deleteShot = async (shotId: string) => {
    const updatedShots = shots.filter(shot => shot.id !== shotId);
    setShots(updatedShots);
    try {
      await AsyncStorage.setItem('shots', JSON.stringify(updatedShots));
    } catch (error) {
      console.error('Error saving updated shots:', error);
    }
  };

  // Calculate distance between coordinates
  const calculateDistance = (coord1: Coordinate | GolfShot, coord2: Coordinate | GolfShot): number => {
    const getCoord = (point: Coordinate | GolfShot): Coordinate => {
      if ('coordinate' in point) return point.coordinate;
      return point;
    };

    const point1 = getCoord(coord1);
    const point2 = getCoord(coord2);

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Calculate distance between coordinates (for CenterDot)
  const calculateCoordinateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get last shot distance
  const getLastShotDistance = (): string => {
    if (shots.length < 2) return '';
    
    const lastShot = shots[shots.length - 1];
    // Filter shots to only include shots from the current hole
    const currentHoleShots = shots.filter(shot => shot.holeNumber === lastShot.holeNumber);
    
    if (currentHoleShots.length < 2) return ''; // First shot on the hole
    
    const previousShot = currentHoleShots[currentHoleShots.length - 2];
    const distance = calculateDistance(previousShot, lastShot);
    
    return `${Math.round(distance * 1.09361)} yards`; // Convert meters to yards
  };

  const handleMapCameraChange = async () => {
    if (!mapRef.current) return;
    try {
      const camera = await mapRef.current.getCamera();
      setMapCenter({
        latitude: camera.center.latitude,
        longitude: camera.center.longitude,
      });
    } catch (error) {
      console.log('Error getting map center:', error);
    }
  };

  const handleMarkerPress = (shotId: string) => {
    setSelectedShot(shotId);
  };

  const handleMarkerDeselect = () => {
    setSelectedShot(null);
  };

  const getLastShot = () => {
    if (shots.length === 0) return null;
    return shots[shots.length - 1];
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadShots();
      await loadLastLocation();
      requestLocationPermission();
    };

    initializeApp();

    return cleanupLocationServices;
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        mapType="satellite"
        initialRegion={initialRegion}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onUserLocationChange={handleMapLocationChange}
        onRegionChangeComplete={handleMapCameraChange}
      >
        {shots.map((shot, index) => (
          <ShotMarker
            key={shot.id}
            shot={shot}
            index={index}
            nextShot={index < shots.length - 1 ? shots[index + 1] : undefined}
            totalShots={shots.length}
            calculateDistance={calculateDistance}
            onDeleteShot={deleteShot}
            onPress={() => handleMarkerPress(shot.id)}
            onCalloutPress={handleMarkerDeselect}
          />
        ))}

        <ShotPath coordinates={shots.map(shot => shot.coordinate)} shots={shots} />
      </MapView>

      {mapCenter && !selectedShot && (
        <CenterDot
          centerCoordinate={mapCenter}
          lastShotCoordinate={getLastShot()?.coordinate}
          gpsCoordinate={userLocation}
          calculateDistance={calculateCoordinateDistance}
        />
      )}

      <ClearDataButton onClear={handleClearData} />

      <HoleSelector
        currentHole={currentHole}
        onHoleChange={setCurrentHole}
        currentShot={shots.filter(shot => shot.holeNumber === currentHole).length}
      />

      <MapControls
        onRecordShot={recordShot}
        onCenter={() => {
          const location = getBestLocation();
          if (location) {
            centerMapOnLocation(location.latitude, location.longitude);
          }
        }}
        isRecordEnabled={true}
        isCenterEnabled={!!getBestLocation()}
        lastShotDistance={getLastShotDistance()}
        accuracy={userLocation?.accuracy ?? initialMapLocation?.accuracy ?? null}
        isAcquiring={!!initialMapLocation && (!userLocation || userLocation.accuracy > 10)}
      />

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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapScreen;
