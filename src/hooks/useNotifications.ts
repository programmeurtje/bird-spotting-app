import { useState, useEffect, useCallback } from "react";
import { NotificationService } from "../services/NotificationService";
import { Observation } from "../types";

interface UseNotificationsResult {
  permission: "granted" | "denied" | "pending";
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  checkRareBirds: (
    observations: Observation[],
    minRarity?: number
  ) => Promise<void>;
}

export const useNotifications = (): UseNotificationsResult => {
  const [permission, setPermission] = useState<
    "granted" | "denied" | "pending"
  >("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request notification permissions
  const requestPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const granted = await NotificationService.requestPermissions();
      setPermission(granted ? "granted" : "denied");
      return granted;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Notificatie toestemming aanvragen mislukt"
      );
      setPermission("denied");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for rare birds and send notifications
  const checkRareBirds = useCallback(
    async (observations: Observation[], minRarity: number = 3) => {
      if (permission !== "granted") return;

      try {
        await NotificationService.checkForRareBirds(observations, minRarity);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Zeldzame vogels controleren mislukt"
        );
      }
    },
    [permission]
  );

  // Check permission status on mount
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const status = await NotificationService.getPermissionStatus();
        setPermission(status as "granted" | "denied" | "pending");
      } catch (err) {
        setError("Notificatie status controleren mislukt");
      }
    };

    checkPermissionStatus();
  }, []);

  return {
    permission,
    loading,
    error,
    requestPermissions,
    checkRareBirds,
  };
};
