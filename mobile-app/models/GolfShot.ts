import { Coordinate } from '@/types/geo.types';

export interface GolfShot {
  id: string;
  coordinate: Coordinate;
  timestamp: Date;
  shotNumber: number;
  holeNumber: number;
  club: string | null;
}
