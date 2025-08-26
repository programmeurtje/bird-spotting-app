import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Observation } from "../types";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Default minimum rarity level for notifications (3 = zeldzaam, 4 = zeer zeldzaam)
const DEFAULT_MIN_RARITY = 3;

export class NotificationService {
  private static notificationsSent: Set<string> = new Set();

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("rare-birds", {
          name: "Zeldzame Vogels",
          description: "Meldingen voor zeldzame vogelwaarnemingen",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3498db",
          sound: "default",
        });
      }

      console.log("✅ Notification permissions granted");
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Check if a bird observation meets the rarity threshold for notifications
   */
  static isRareBird(
    observation: Observation,
    minRarity: number = DEFAULT_MIN_RARITY
  ): boolean {
    return observation.rarity.id >= minRarity;
  }

  /**
   * Check observations for rare birds and send notifications
   */
  static async checkForRareBirds(
    observations: Observation[],
    minRarity: number = DEFAULT_MIN_RARITY
  ): Promise<void> {
    try {
      const rareBirds = observations.filter((obs) =>
        this.isRareBird(obs, minRarity)
      );

      console.log(
        `🔍 Found ${rareBirds.length} rare birds (rarity >= ${minRarity}) out of ${observations.length} observations`
      );

      for (const observation of rareBirds) {
        await this.sendRareBirdNotification(observation);
      }
    } catch (error) {
      console.error("Error checking for rare birds:", error);
    }
  }

  /**
   * Send notification for a rare bird sighting
   */
  static async sendRareBirdNotification(
    observation: Observation
  ): Promise<void> {
    try {
      // Create unique key to prevent duplicate notifications
      const notificationKey = `${observation.species.id}-${observation.id}`;

      if (this.notificationsSent.has(notificationKey)) {
        console.log(
          `Notification already sent for ${observation.species.name}`
        );
        return;
      }

      const distance = observation.distance?.toFixed(1) || "?";
      const location = observation.location.name;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${observation.rarity.emoji} ${
            observation.rarity.name.charAt(0).toUpperCase() +
            observation.rarity.name.slice(1)
          } vogel gespot!`,
          body: `${observation.species.name} gezien op ${distance}km afstand bij ${location}`,
          data: {
            observationId: observation.id,
            speciesName: observation.species.name,
            location: observation.location,
            distance: observation.distance,
            rarity: observation.rarity,
          },
          sound: "default",
        },
        trigger: null, // Send immediately
        identifier: notificationKey,
      });

      // Mark as sent
      this.notificationsSent.add(notificationKey);

      console.log(
        `📱 Sent rare bird notification: ${observation.species.name}`
      );
    } catch (error) {
      console.error("Error sending rare bird notification:", error);
    }
  }

  /**
   * Send a test notification
   */
  static async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 Test Notificatie",
          body: "Notificaties werken! Je krijgt meldingen wanneer er zeldzame vogels in de buurt zijn.",
          data: { test: true },
        },
        trigger: null,
      });

      console.log("📱 Test notification sent");
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }

  /**
   * Clear notification history (for testing)
   */
  static clearNotificationHistory(): void {
    this.notificationsSent.clear();
    console.log("🧹 Notification history cleared");
  }

  /**
   * Get notification permission status
   */
  static async getPermissionStatus(): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error("Error getting notification permission status:", error);
      return "unknown";
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🚫 All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }
}
