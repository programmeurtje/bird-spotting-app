import { useState, useEffect, useCallback } from "react";
import { LocationService } from "../services/LocationService";
import { LocationCoordinates } from "../types";

interface UseLocationResult {
  location: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Locatie niet beschikbaar. Controleer je instellingen."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
  };
};
