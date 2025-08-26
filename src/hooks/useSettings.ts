import { useState, useEffect, useCallback } from "react";
import { SettingsService, AppSettings } from "../services/SettingsService";

interface UseSettingsResult {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => Promise<void>;
}

export const useSettings = (): UseSettingsResult => {
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    searchRadius: 2,
    rarebirdsOnly: false,
    minRarityLevel: 0,
    notificationMinRarity: 3,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await SettingsService.loadSettings();
        setSettings(loadedSettings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Instellingen laden mislukt"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setError(null);

      try {
        const updatedSettings = await SettingsService.updateSetting(key, value);
        setSettings(updatedSettings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Instelling bijwerken mislukt"
        );
      }
    },
    []
  );

  return {
    settings,
    loading,
    error,
    updateSetting,
  };
};
