import { useState, useEffect, useCallback } from 'react';
import { GolfShot } from '@/models/GolfShot';
import { UserLocation } from '@/types/geo.types';
import { loadShotsFromStorage, saveShotsToStorage, clearAllData } from '@/services/storageService';
import { calculateDistance } from '@/utils/geo';

export const useShotManagement = () => {
  const [shots, setShots] = useState<GolfShot[]>([]);
  const [currentHole, setCurrentHole] = useState(1);

  const loadShots = useCallback(async () => {
    const loadedShots = await loadShotsFromStorage();
    setShots(loadedShots);
  }, []);

  useEffect(() => {
    loadShots();
  }, [loadShots]);

  const createShot = (location: UserLocation, club: string) => {
    const currentHoleShots = shots.filter(shot => shot.holeNumber === currentHole);
    const newShot: GolfShot = {
      id: Date.now().toString(),
      coordinate: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      timestamp: new Date(),
      shotNumber: currentHoleShots.length + 1,
      holeNumber: currentHole,
      club,
    };

    const updatedShots = [...shots, newShot];
    setShots(updatedShots);
    saveShotsToStorage(updatedShots).catch(error => {
      console.error('Error saving shots:', error);
    });
  };

  const deleteShot = (shotId: string) => {
    const updatedShots = shots.filter(shot => shot.id !== shotId);
    setShots(updatedShots);
    saveShotsToStorage(updatedShots).catch(error => {
      console.error('Error saving shots:', error);
    });
  };
  
  const clearShots = async () => {
    setShots([]);
    setCurrentHole(1);
    await clearAllData();
  };

  const getLastShotDistance = (): string => {
    const currentHoleShots = shots.filter(shot => shot.holeNumber === currentHole);
    if (currentHoleShots.length < 2) return '';

    const lastShot = currentHoleShots[currentHoleShots.length - 1];
    const previousShot = currentHoleShots[currentHoleShots.length - 2];
    const distance = calculateDistance(previousShot.coordinate, lastShot.coordinate);

    return `${Math.round(distance * 1.09361)} yards`; // Convert meters to yards
  };

  const updateShots = (updatedShots: GolfShot[]) => {
    setShots(updatedShots);
    saveShotsToStorage(updatedShots).catch(error => {
      console.error('Error saving shots:', error);
    });
  };

  return {
    shots,
    loadShots,
    currentHole,
    setCurrentHole,
    createShot,
    deleteShot,
    clearShots,
    getLastShotDistance,
    getLastShot: () => shots[shots.length - 1] || null,
    updateShots,
  };
};
