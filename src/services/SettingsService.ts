import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppSettings {
  notificationsEnabled: boolean;
  searchRadius: number; // in kilometers
  rarebirdsOnly: boolean;
  minRarityLevel: number; // 0=all, 1=algemeen+, 2=vrij algemeen+, 3=zeldzaam+, 4=zeer zeldzaam only
  notificationMinRarity: number; // minimum rarity for notifications
  lastUpdated: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  searchRadius: 2,
  rarebirdsOnly: false,
  minRarityLevel: 0, // Show all birds by default
  notificationMinRarity: 3, // Notify for zeldzaam (3) and zeer zeldzaam (4)
  lastUpdated: new Date().toISOString(),
};

const SETTINGS_KEY = "@bird_spotting_settings";

export class SettingsService {
  /**
   * Load settings from AsyncStorage
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);

      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        console.log("📱 Settings loaded:", settings);

        // Merge with defaults to handle new settings
        return {
          ...DEFAULT_SETTINGS,
          ...settings,
        };
      }

      console.log("📱 No settings found, using defaults");
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error loading settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      const settingsJson = JSON.stringify(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_KEY, settingsJson);

      console.log("💾 Settings saved:", updatedSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  /**
   * Update a specific setting
   */
  static async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<AppSettings> {
    try {
      const currentSettings = await this.loadSettings();
      const updatedSettings = {
        ...currentSettings,
        [key]: value,
      };

      await this.saveSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(): Promise<AppSettings> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      console.log("🔄 Settings reset to defaults");
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error resetting settings:", error);
      throw error;
    }
  }

  /**
   * Get available search radius options
   */
  static getRadiusOptions(): Array<{ label: string; value: number }> {
    return [
      { label: "1 km", value: 1 },
      { label: "2 km", value: 2 },
      { label: "5 km", value: 5 },
      { label: "10 km", value: 10 },
      { label: "20 km", value: 20 },
    ];
  }

  /**
   * Validate settings
   */
  static validateSettings(settings: Partial<AppSettings>): boolean {
    if (settings.searchRadius !== undefined) {
      const validRadii = this.getRadiusOptions().map((option) => option.value);
      if (!validRadii.includes(settings.searchRadius)) {
        console.warn("Invalid search radius:", settings.searchRadius);
        return false;
      }
    }

    return true;
  }
}
