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

/** --- Simple singleton store --- */
let currentSettings: AppSettings | null = null;
const listeners = new Set<(s: AppSettings) => void>();

function notifyAll(next: AppSettings) {
  currentSettings = next;
  listeners.forEach((l) => l(next));
}

export const useSettings = (): UseSettingsResult => {
  const [settings, setSettings] = useState<AppSettings>(
    currentSettings ?? {
      notificationsEnabled: true,
      searchRadius: 2,
      rarebirdsOnly: false,
      minRarityLevel: 0,
      notificationMinRarity: 3,
      lastUpdated: new Date().toISOString(),
    }
  );
  const [loading, setLoading] = useState(!currentSettings);
  const [error, setError] = useState<string | null>(null);

  // Initial load + subscribe to external updates
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!currentSettings) {
          const loaded = await SettingsService.loadSettings();
          if (mounted) setSettings(loaded);
          currentSettings = loaded;
        } else {
          // ensure local state matches the singleton if it was set elsewhere
          setSettings(currentSettings);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e instanceof Error ? e.message : "Instellingen laden mislukt"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const l = (s: AppSettings) => setSettings(s);
    listeners.add(l);
    return () => {
      mounted = false;
      listeners.delete(l);
    };
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      try {
        const next = await SettingsService.updateSetting(key, value);
        // update local AND broadcast to all hook users (Home, Settings, etc.)
        setSettings(next);
        notifyAll(next);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Instelling bijwerken mislukt"
        );
        throw e;
      }
    },
    []
  );

  return { settings, loading, error, updateSetting };
};
