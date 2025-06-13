// import React, {useState, useEffect, useRef} from 'react';
// import {
//   StyleSheet,
//   View,
//   Alert,
//   Platform,
//   Text,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import MapView from 'react-native-maps';
// import * as Location from 'expo-location';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MapControls from './MapControls';
// import HoleSelector from './HoleSelector';
// import ClubSelector from './ClubSelector';
// import ShotMarker from './ShotMarker';
// import ShotPath from './ShotPath';
// import ClearDataButton from './ClearDataButton';
// import CenterDot from './CenterDot';
// import { calculateDistance } from '@/utils/geo';
// import { Coordinate, UserLocation } from '@/types/geo.types';
// import { GolfShot } from '@/models/GolfShot';

// const MapScreen: React.FC = () => {
//   const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
//   const [currentHole, setCurrentHole] = useState(1);
//   const [mapCenter, setMapCenter] = useState<Coordinate | null>(null);
//   const [initialRegion, setInitialRegion] = useState({
//     latitude: 33.66745,
//     longitude: -117.9298,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   });
//   const [shots, setShots] = useState<GolfShot[]>([]);
//   const [hasLocationPermission, setHasLocationPermission] = useState(false);
//   const [initialMapLocation, setInitialMapLocation] = useState<UserLocation | null>(null);
//   const [showClubSelector, setShowClubSelector] = useState(false);
//   const [pendingShot, setPendingShot] = useState<UserLocation | null>(null);
//   const [selectedShot, setSelectedShot] = useState<string | null>(null);
//   const mapRef = useRef<MapView>(null);
//   const locationSubscription = useRef<Location.LocationSubscription | null>(null);

//   const handleClearData = async () => {
//     setShots([]);
//     setCurrentHole(1);
//     try {
//       await AsyncStorage.multiRemove(['golfShots', 'lastKnownLocation']);
//     } catch (error) {
//       console.error('Error clearing data:', error);
//     }
//   };

//   // Request foreground (during active use) and background (during lock screen, etc) location permissions
//   const requestLocationPermission = async () => {
//     try {
//       const foreground = await Location.requestForegroundPermissionsAsync();
//       // if (foreground.status !== 'granted') {
//       //   Alert.alert(
//       //     'Permission Denied',
//       //     'Location permission is required to track your golf shots.'
//       //   );
//       //   return;
//       // }

//       const background = await Location.requestBackgroundPermissionsAsync();
//       // if (background.status !== 'granted') {
//       //   Alert.alert(
//       //     'Background Permission Denied',
//       //     'Background location permission is recommended for GPS responsiveness.'
//       //   );
//       // }

//       setHasLocationPermission(true);
//       startLocationTracking();
//     } catch (error) {
//       console.log('Permission request error:', error);
//     }
//   };

//   const stopLocationTask = async () => {
//     try {
//       await Location.stopLocationUpdatesAsync('golf-gps-location');
//     } catch (error) {
//       console.log('Error stopping location updates:', error);
//     }
//   };

//   const cleanupLocationServices = () => {
//     if (locationSubscription.current) {
//       locationSubscription.current.remove();
//     }
//     stopLocationTask();
//   };

//   const handleMapLocationChange = (e: any) => {
//     if ((!userLocation || userLocation.accuracy > 1) && e.nativeEvent.coordinate) {
//       const mapLocation: UserLocation = {
//         latitude: e.nativeEvent.coordinate.latitude,
//         longitude: e.nativeEvent.coordinate.longitude,
//         accuracy: e.nativeEvent.coordinate.accuracy || 100, // Default to 100m accuracy
//       };
//       setInitialMapLocation(mapLocation);
//     }
//   };

//   const centerMapOnLocation = (latitude: number, longitude: number) => {
//     if (mapRef.current) {
//       mapRef.current.animateToRegion({
//         latitude,
//         longitude,
//         latitudeDelta: 0.001,  // Zoom level
//         longitudeDelta: 0.001, // Zoom level
//       }, 1000); // Zoom-in animation: 1 second
//     }
//   };

//   const getBestLocation = () => {
//     // Intent: Reduce users seeing map init before GPS is ready.
//     // Currently using hardcoded initial location of a golf course if GPS is not ready.
//     // TODO: alternative is to get last known location from AsyncStorage or last golf course user played.
//     return (userLocation && userLocation.accuracy <= 50) ? userLocation : initialMapLocation;
//   };

//   const saveLastLocation = async (location: UserLocation) => {
//     try {
//       await AsyncStorage.setItem('lastKnownLocation', JSON.stringify({
//         latitude: location.latitude,
//         longitude: location.longitude,
//         timestamp: new Date().toISOString(),
//       }));
//     } catch (error) {
//       console.log('Error saving location:', error);
//     }
//   };

//   const loadLastLocation = async () => {
//     // TODO: or get location of previous golf course user played.
//     try {
//       const savedLocation = await AsyncStorage.getItem('lastKnownLocation');
//       if (savedLocation) {
//         const location = JSON.parse(savedLocation);
//         centerMapOnLocation(location.latitude, location.longitude);
//       }
//     } catch (error) {
//       console.log('Error loading location:', error);
//     }
//   };

//   const handleLocationUpdate = (location: Location.LocationObject) => {
//     const accuracy = location.coords.accuracy || 100;
//     const newLocation: UserLocation = {
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//       accuracy: accuracy,
//     };

//     if (!userLocation || accuracy < userLocation.accuracy) {
//       setUserLocation(newLocation);
//       saveLastLocation(newLocation);
//     }
//   };

//   const startLocationTracking = async () => {
//     if (!hasLocationPermission) {
//       requestLocationPermission();
//       return;
//     }

//     try {
//       await Location.enableNetworkProviderAsync();
//       await Location.hasServicesEnabledAsync();
      
//       // Intent: Reduce users waiting for map init before GPS is fully ready.
//       // Get quick initial location with balanced accuracy
//       const quickLocation = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       if (quickLocation) {
//         handleLocationUpdate(quickLocation);
//         centerMapOnLocation(quickLocation.coords.latitude, quickLocation.coords.longitude);
//       }
      
//       // iOS-specific background updates to maintain better GPS accuracy
//       // Cost is battery power consumption
//       // TODO: increase interval when app is in background to save battery
//       if (Platform.OS === 'ios') {
//         const { status } = await Location.requestBackgroundPermissionsAsync();
//         if (status === 'granted') {
//           await Location.startLocationUpdatesAsync('golf-gps-location', {
//             accuracy: Location.Accuracy.BestForNavigation,
//             timeInterval: 500,
//             distanceInterval: 0.1,
//             activityType: Location.ActivityType.Fitness,
//             showsBackgroundLocationIndicator: true,
//           });
//         }
//       }
      
//       // Start immediate high-accuracy updates
//       const subscription = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.BestForNavigation,
//           timeInterval: 500,
//           distanceInterval: 0.1,
//           mayShowUserSettingsDialog: true,
//         },
//         handleLocationUpdate
//       );

//       locationSubscription.current = subscription;

//     } catch (error) {
//       console.log('Location tracking error:', error);
//       Alert.alert(
//         'Error',
//         'Failed to start location tracking. Please check your device settings.'
//       );
//     }
//   };

//   // Record golf shot at the center of the map view because GPS might not be accurate.
//   // User adjust the location with the GPS pin for location reference.
//   // TODO: add component to calculate center of the map view to last shot.
//   const recordShot = async () => {
//     if (!mapRef.current) {
//       Alert.alert('Error', 'Map is not ready');
//       return;
//     }

//     try {
//       const camera = await mapRef.current.getCamera();
//       const mapCenterLocation: UserLocation = {
//         latitude: camera.center.latitude,
//         longitude: camera.center.longitude,
//         accuracy: 1, // Using 1m accuracy since this is a manual placement
//       };

//       setPendingShot(mapCenterLocation);
//       setShowClubSelector(true);
//     } catch (error) {
//       console.log('Error getting map center:', error);
//       Alert.alert(
//         'Error',
//         'Could not record shot at map center. Please try again.'
//       );
//     }
//   };

//   const handleClubSelect = (club: string) => {
//     if (pendingShot) {
//       createShot(pendingShot, club);
//       setPendingShot(null);
//     }
//     setShowClubSelector(false);
//   };

//   // Save shots to AsyncStorage
//   const saveShots = async (newShots: GolfShot[]) => {
//     try {
//       const shotsData = newShots.map(shot => ({
//         ...shot,
//         timestamp: shot.timestamp.toISOString(), // Convert Date to string for storage
//       }));
//       await AsyncStorage.setItem('golfShots', JSON.stringify(shotsData));
//     } catch (error) {
//       console.log('Error saving shots:', error);
//     }
//   };

//   // Load shots from AsyncStorage
//   const loadShots = async () => {
//     try {
//       const savedShots = await AsyncStorage.getItem('golfShots');
//       if (savedShots) {
//         const parsedShots = JSON.parse(savedShots);
//         // Convert string timestamps back to Date objects
//         const shotsWithDates = parsedShots.map((shot: any) => ({
//           ...shot,
//           timestamp: new Date(shot.timestamp),
//         }));
//         setShots(shotsWithDates);
//       }
//     } catch (error) {
//       console.log('Error loading shots:', error);
//     }
//   };

//   const createShot = (location: UserLocation, club: string) => {
//     const currentHoleShots = shots.filter(shot => shot.holeNumber === currentHole);
//     const newShot: GolfShot = {
//       id: Date.now().toString(),
//       coordinate: {
//         latitude: location.latitude,
//         longitude: location.longitude,
//       },
//       timestamp: new Date(),
//       shotNumber: currentHoleShots.length + 1,  // Shot number for this specific hole
//       holeNumber: currentHole,
//       club,
//     };

//     const updatedShots = [...shots, newShot];
//     setShots(updatedShots);
//     saveShots(updatedShots);
//     centerMapOnLocation(location.latitude, location.longitude);
//   };

//   const deleteShot = async (shotId: string) => {
//     const updatedShots = shots.filter(shot => shot.id !== shotId);
//     setShots(updatedShots);
//     try {
//       await AsyncStorage.setItem('shots', JSON.stringify(updatedShots));
//     } catch (error) {
//       console.error('Error saving updated shots:', error);
//     }
//   };

//   // Get last shot distance
//   const getLastShotDistance = (): string => {
//     if (shots.length < 2) return '';
    
//     const lastShot = shots[shots.length - 1];
//     // Filter shots to only include shots from the current hole
//     const currentHoleShots = shots.filter(shot => shot.holeNumber === lastShot.holeNumber);
    
//     if (currentHoleShots.length < 2) return ''; // First shot on the hole
    
//     const previousShot = currentHoleShots[currentHoleShots.length - 2];
//     const distance = calculateDistance(previousShot.coordinate, lastShot.coordinate);
    
//     return `${Math.round(distance * 1.09361)} yards`; // Convert meters to yards
//   };

//   const handleMapCameraChange = async () => {
//     if (!mapRef.current) return;
//     try {
//       const camera = await mapRef.current.getCamera();
//       setMapCenter({
//         latitude: camera.center.latitude,
//         longitude: camera.center.longitude,
//       });
//     } catch (error) {
//       console.log('Error getting map center:', error);
//     }
//   };

//   const handleMarkerPress = (shotId: string) => {
//     // Toggle selection: if same marker is tapped again, deselect it
//     setSelectedShot(current => current === shotId ? null : shotId);
//   };

//   const getLastShot = () => {
//     if (shots.length === 0) return null;
//     return shots[shots.length - 1];
//   };

//   useEffect(() => {
//     const initializeApp = async () => {
//       await loadShots();
//       await loadLastLocation();
//       requestLocationPermission();
//     };

//     initializeApp();

//     return cleanupLocationServices;
//   }, []);

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         provider="google"
//         mapType="satellite"
//         initialRegion={initialRegion}
//         showsUserLocation={true}
//         followsUserLocation={false}
//         showsMyLocationButton={false}
//         showsCompass={true}
//         showsScale={true}
//         onUserLocationChange={handleMapLocationChange}
//         onRegionChangeComplete={handleMapCameraChange}
//       >
//         {shots.map((shot, index) => (
//           <ShotMarker
//             key={shot.id}
//             shot={shot}
//             index={index}
//             nextShot={index < shots.length - 1 ? shots[index + 1] : undefined}
//             totalShots={shots.length}
//             onDeleteShot={deleteShot}
//             onPress={() => handleMarkerPress(shot.id)}
//           />
//         ))}

//         <ShotPath coordinates={shots.map(shot => shot.coordinate)} shots={shots} />
//       </MapView>

//       {mapCenter && !selectedShot && (
//         <CenterDot
//           centerCoordinate={mapCenter}
//           lastShotCoordinate={getLastShot()?.coordinate}
//           gpsCoordinate={userLocation}
//           calculateDistance={calculateDistance}
//         />
//       )}

//       <ClearDataButton onClear={handleClearData} />

//       <HoleSelector
//         currentHole={currentHole}
//         onHoleChange={setCurrentHole}
//         currentShot={shots.filter(shot => shot.holeNumber === currentHole).length}
//       />

//       <MapControls
//         onRecordShot={recordShot}
//         onCenter={() => {
//           const location = getBestLocation();
//           if (location) {
//             centerMapOnLocation(location.latitude, location.longitude);
//           }
//         }}
//         isRecordEnabled={true}
//         isCenterEnabled={!!getBestLocation()}
//         lastShotDistance={getLastShotDistance()}
//         accuracy={userLocation?.accuracy ?? initialMapLocation?.accuracy ?? null}
//         isAcquiring={!!initialMapLocation && (!userLocation || userLocation.accuracy > 10)}
//       />

//       <ClubSelector
//         visible={showClubSelector}
//         onSelectClub={handleClubSelect}
//         onCancel={() => {
//           setPendingShot(null);
//           setShowClubSelector(false);
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
// });

// export default MapScreen;

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { loadLastLocationFromStorage } from '@/services/storageService';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useShotManagement } from '@/hooks/useShotManagement';
import { calculateDistance } from '@/utils/geo';
import { Coordinate } from '@/types/geo.types';

import MapControls from './MapControls';
import HoleSelector from './HoleSelector';
import ClubSelector from './ClubSelector';
import ShotMarker from './ShotMarker';
import ShotPath from './ShotPath';
import ClearDataButton from './ClearDataButton';
import CenterDot from './CenterDot';

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

// TODO: refactor props ShotMarker, ShotPath, CenterDot, MapControls
// some props are not needed and can be calculated within component
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
        {shots.map((shot, index) => (
          <ShotMarker
            key={shot.id}
            shot={shot}
            index={index}
            nextShot={index < shots.length - 1 ? shots[index + 1] : undefined}
            totalShots={shots.length}
            onDeleteShot={() => deleteShot(shot.id)}
            onPress={() => handleMarkerPress(shot.id)}
          />
        ))}
        <ShotPath coordinates={shots.map(shot => shot.coordinate)} shots={shots} />
      </MapView>

      {mapCenter && !selectedShot && (
        <CenterDot
          centerCoordinate={mapCenter}
          lastShotCoordinate={getLastShot()?.coordinate}
          gpsCoordinate={userLocation}
          calculateDistance={calculateDistance}
        />
      )}

      <ClearDataButton onClear={clearShots} />

      <HoleSelector
        currentHole={currentHole}
        onHoleChange={setCurrentHole}
        currentShot={shots.filter(shot => shot.holeNumber === currentHole).length}
      />

      <MapControls
        onRecordShot={handleRecordShot}
        onCenter={handleCenterMap}
        isRecordEnabled={true}
        isCenterEnabled={!!userLocation}
        lastShotDistance={getLastShotDistance()}
        accuracy={userLocation?.accuracy ?? null}
        isAcquiring={!userLocation || (userLocation.accuracy > 10)}
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
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' },
});

export default MapScreen;
