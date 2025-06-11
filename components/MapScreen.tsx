import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';

interface GolfShot {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  shotNumber: number;
  accuracy: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [shots, setShots] = useState<GolfShot[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasLocationPermission(true);
        startLocationTracking();
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to track your golf shots.'
        );
      }
    } catch (error) {
      console.log('Permission request error:', error);
    }
  };

  const centerMapOnLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01, // More zoomed in for better accuracy
        longitudeDelta: 0.01,
      }, 1000); // 1 second animation
    }
  };

  // Start location tracking
  const startLocationTracking = async () => {
    if (!hasLocationPermission) {
      requestLocationPermission();
      return;
    }

    try {
      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });

      const newLocation: UserLocation = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        accuracy: initialLocation.coords.accuracy || 0,
      };
      
      setUserLocation(newLocation);
      centerMapOnLocation(newLocation.latitude, newLocation.longitude);

      // Start watching location
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        (location) => {
          const newLocation: UserLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
          };
          
          setUserLocation(newLocation);
          
          if (mapRef.current && !isTracking) {
            centerMapOnLocation(newLocation.latitude, newLocation.longitude);
          }
        }
      );

      locationSubscription.current = subscription;
      setIsTracking(true);
    } catch (error) {
      console.log('Error starting location tracking:', error);
      Alert.alert('Location Error', 'Unable to get your location. Please check your GPS settings.');
    }
  };

  // Record golf shot at current location
  const recordShot = () => {
    if (!userLocation) {
      Alert.alert('No Location', 'Please wait for GPS to acquire your location.');
      return;
    }

    if (userLocation.accuracy > 20) {
      Alert.alert(
        'Poor GPS Accuracy', 
        `GPS accuracy is ${Math.round(userLocation.accuracy)}m. Wait for better signal?`,
        [
          {text: 'Wait', style: 'cancel'},
          {text: 'Record Anyway', onPress: () => createShot()}
        ]
      );
      return;
    }

    createShot();
  };

  const createShot = () => {
    if (!userLocation) return;

    const newShot: GolfShot = {
      id: Date.now().toString(),
      coordinate: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      timestamp: new Date(),
      shotNumber: shots.length + 1,
      accuracy: userLocation.accuracy,
    };

    setShots(prevShots => [...prevShots, newShot]);

    Alert.alert(
      'Shot Recorded!', 
      `Shot #${newShot.shotNumber} recorded with ${Math.round(newShot.accuracy * 1.09361)}yrds accuracy.`
    );
  };

  // Calculate distance between shots
  const calculateDistance = (shot1: GolfShot, shot2: GolfShot): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (shot1.coordinate.latitude * Math.PI) / 180;
    const φ2 = (shot2.coordinate.latitude * Math.PI) / 180;
    const Δφ = ((shot2.coordinate.latitude - shot1.coordinate.latitude) * Math.PI) / 180;
    const Δλ = ((shot2.coordinate.longitude - shot1.coordinate.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Clear all shots
  const clearShots = () => {
    Alert.alert(
      'Clear All Shots',
      'Are you sure you want to clear all recorded shots?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Clear', style: 'destructive', onPress: () => setShots([])}
      ]
    );
  };

  // Get polyline coordinates for shot path
  const getPolylineCoordinates = () => {
    return shots.map(shot => shot.coordinate);
  };

  // Get last shot distance
  const getLastShotDistance = (): string => {
    if (shots.length < 2) return '';
    
    const lastShot = shots[shots.length - 1];
    const previousShot = shots[shots.length - 2];
    const distance = calculateDistance(previousShot, lastShot);
    
    return `${Math.round(distance * 1.09361)} yards`; // Convert meters to yards
  };

  useEffect(() => {
    requestLocationPermission();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const initialRegion = {
    latitude: 33.66745,
    longitude: -117.9298,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        mapType="satellite"
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* Shot markers */}
        {shots.map((shot, index) => (
          <Marker
            key={shot.id}
            coordinate={shot.coordinate}
            title={`Shot ${shot.shotNumber}`}
            description={`Accuracy: ${Math.round(shot.accuracy)}m${
              index > 0 ? ` | Distance: ${Math.round(
                calculateDistance(shots[index - 1], shot) * 1.09361
              )} yards` : ''
            }`}
            pinColor={index === 0 ? 'green' : index === shots.length - 1 ? 'red' : 'orange'}
          />
        ))}

        {/* Shot path polyline */}
        {shots.length > 1 && (
          <Polyline
            coordinates={getPolylineCoordinates()}
            strokeColor="#FF0000"
            strokeWidth={3}
            lineDashPattern={[5, 10]}
          />
        )}
      </MapView>

      {/* Control buttons overlay */}
      <View style={styles.controlsContainer}>
        {/* GPS Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            GPS: {userLocation ? `${Math.round(userLocation.accuracy)}m (${Math.round(userLocation.accuracy * 1.09361)}yrds)` : 'Searching...'}
          </Text>
          <Text style={styles.statusText}>
            Shots: {shots.length}
          </Text>
          {getLastShotDistance() && (
            <Text style={styles.distanceText}>
              Last: {getLastShotDistance()}
            </Text>
          )}
        </View>

        {/* Main record button */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            !userLocation && styles.recordButtonDisabled
          ]}
          onPress={recordShot}
          disabled={!userLocation}
        >
          <Text style={styles.recordButtonText}>
            RECORD SHOT
          </Text>
        </TouchableOpacity>

        {/* Secondary buttons */}
        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              if (userLocation) {
                centerMapOnLocation(userLocation.latitude, userLocation.longitude);
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, shots.length === 0 && styles.secondaryButtonDisabled]}
            onPress={clearShots}
            disabled={shots.length === 0}
          >
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  distanceText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  recordButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
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
  secondaryButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  secondaryButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
  },
});

export default MapScreen;
