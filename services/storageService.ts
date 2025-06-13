import AsyncStorage from '@react-native-async-storage/async-storage';
import { GolfShot } from '@/models/GolfShot';
import { UserLocation } from '@/types/geo.types';

const SHOTS_KEY = 'golfShots';
const LAST_LOCATION_KEY = 'lastKnownLocation';

//==============================================================================
// Shot Management
//==============================================================================
export const saveShotsToStorage = async (shots: GolfShot[]): Promise<void> => {
  try {
    const shotsData = shots.map(shot => ({
      ...shot,
      timestamp: shot.timestamp.toISOString(),
    }));
    await AsyncStorage.setItem(SHOTS_KEY, JSON.stringify(shotsData));
  } catch (error) {
    console.error('Error saving shots:', error);
  }
};

export const loadShotsFromStorage = async (): Promise<GolfShot[]> => {
  try {
    const savedShots = await AsyncStorage.getItem(SHOTS_KEY);
    if (savedShots) {
      const parsedShots = JSON.parse(savedShots);
      return parsedShots.map((shot: any) => ({
        ...shot,
        timestamp: new Date(shot.timestamp),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading shots:', error);
    return [];
  }
};

//==============================================================================
// Location Management
//==============================================================================
export const saveLastLocationToStorage = async (location: UserLocation): Promise<void> => {
  try {
    const locationData = {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.error('Error saving last location:', error);
  }
};

export const loadLastLocationFromStorage = async (): Promise<UserLocation | null> => {
  try {
    const savedLocation = await AsyncStorage.getItem(LAST_LOCATION_KEY);
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch (error) {
    console.error('Error loading last location:', error);
    return null;
  }
};

//==============================================================================
// Data Clearing
//==============================================================================
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([SHOTS_KEY, LAST_LOCATION_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
