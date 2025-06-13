import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { UserLocation } from '@/types/geo.types';
import { saveLastLocationToStorage } from '@/services/storageService';

// const LOCATION_TASK_NAME = 'golf-gps-location'; // Commented out for now

export const useLocationTracking = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const handleLocationUpdate = (location: Location.LocationObject) => {
    const accuracy = location.coords.accuracy || 100;
    const newLocation: UserLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: accuracy,
    };

    // Update location state and save to storage
    setUserLocation(prevLocation => {
      // Only update if no previous location or the new one is more accurate
      if (!prevLocation || accuracy < prevLocation.accuracy) {
        saveLastLocationToStorage(newLocation);
        return newLocation;
      }
      return prevLocation;
    });
  };

  const startLocationTracking = async () => {
    try {
      // Enable network provider and check if location services are enabled
      await Location.enableNetworkProviderAsync();
      await Location.hasServicesEnabledAsync();

      // Get a quick initial location to speed up map centering
      const quickLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      if (quickLocation) {
        handleLocationUpdate(quickLocation);
      }

      // iOS-specific background updates commented out for now
      // if (Platform.OS === 'ios') {
      //   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      //     accuracy: Location.Accuracy.BestForNavigation,
      //     timeInterval: 500,
      //     distanceInterval: 0.1,
      //     activityType: Location.ActivityType.Fitness,
      //     showsBackgroundLocationIndicator: true,
      //   });
      // }

      // Start immediate high-accuracy updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500,
          distanceInterval: 0.1,
          mayShowUserSettingsDialog: true,
        },
        handleLocationUpdate
      );

    } catch (error) {
      console.error('Location tracking error:', error);
      Alert.alert(
        'Error',
        'Failed to start location tracking. Please check your device settings.'
      );
    }
  };

  // Initialize location tracking with permissions
  useEffect(() => {
    const initializeLocationTracking = async () => {
      try {
        console.log('Starting location initialization...');

        const currentPermissions = await Location.getForegroundPermissionsAsync();
        console.log('Current foreground permissions:', currentPermissions);

        console.log('Requesting foreground permissions...');
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        console.log('Foreground permission result:', foregroundStatus);

        if (foregroundStatus !== 'granted') {
          console.log('Foreground permission denied');
          Alert.alert(
            'Permission Denied',
            'Location permission is required to track your golf shots.'
          );
          return;
        }

        // Background permissions commented out for now
        // console.log('Requesting background permissions...');
        // const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        // console.log('Background permission result:', backgroundStatus);

        // if (backgroundStatus !== 'granted') {
        //   console.log('Background permission denied');
        //   Alert.alert(
        //     'Background Permission Denied',
        //     'Background location permission is recommended for GPS responsiveness.'
        //   );
        // }

        console.log('Setting hasPermission to true');
        setHasPermission(true);

        console.log('Starting location tracking...');
        await startLocationTracking();

      } catch (error) {
        console.error('Location initialization error:', error);
        Alert.alert(
          'Error',
          `Failed to initialize location tracking: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    };

    initializeLocationTracking();

    // Cleanup function
    return () => {
      locationSubscription.current?.remove();
      // Background location cleanup commented out for now
      // if (Platform.OS === 'ios') {
      //   Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch(console.error);
      // }
    };
  }, []);

  return { userLocation, hasPermission };
};
