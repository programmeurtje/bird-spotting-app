import { useState, useCallback } from "react";
import { WaarnemingAPI } from "../services/WaarnemingAPI";
import { Observation, LocationCoordinates } from "../types";

interface UseObservationsResult {
  observations: Observation[];
  loading: boolean;
  error: string | null;
  fetchObservations: (
    location: LocationCoordinates,
    radius?: number
  ) => Promise<void>;
}

export const useObservations = (): UseObservationsResult => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObservations = useCallback(
    async (location: LocationCoordinates, radius: number = 2) => {
      setLoading(true);
      setError(null);

      try {
        const result = await WaarnemingAPI.getRecentObservations(
          location,
          radius
        );
        setObservations(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Geen internetverbinding. Probeer het later opnieuw."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    observations,
    loading,
    error,
    fetchObservations,
  };
};
