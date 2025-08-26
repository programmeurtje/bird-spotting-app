// Location types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// API types
export interface ObservationParams {
  lat: number;
  lng: number;
  radius_km: number;
  date_from: string;
  date_to: string;
  species_group?: string;
}

export interface RarityLevel {
  id: number;
  name: string;
  color: string;
  emoji: string;
}

export interface Species {
  id: number;
  name: string;
  scientific_name: string;
  photo_url?: string;
}

export interface Observation {
  id: number;
  species: Species;
  date: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  observer: string;
  distance?: number;
  rarity: RarityLevel;
}

// App state types
export interface AppState {
  location: {
    coordinates: LocationCoordinates | null;
    permission: "granted" | "denied" | "pending";
    error: string | null;
  };
  observations: {
    data: Observation[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
}

// Re-export navigation types
export * from "./navigation";
