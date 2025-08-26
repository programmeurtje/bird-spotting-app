import * as Location from "expo-location";
import { LocationCoordinates } from "../types";

export class LocationService {
  /**
   * Request location permissions from the user
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  /**
   * Get current location coordinates
   */
  static async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      // Request permission and get location in one go
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error(
          "Locatie toegang is vereist om vogels in je buurt te vinden"
        );
      }

      // Check if location services are enabled
      const isEnabled = await this.isLocationEnabled();
      if (!isEnabled) {
        throw new Error(
          "Locatieservices zijn uitgeschakeld. Schakel ze in via instellingen."
        );
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error; // Re-throw to let caller handle the specific error message
    }
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error("Error checking location services:", error);
      return false;
    }
  }

  /**
   * Get location permission status
   */
  static async getPermissionStatus(): Promise<
    "granted" | "denied" | "pending"
  > {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      switch (status) {
        case "granted":
          return "granted";
        case "denied":
          return "denied";
        default:
          return "pending";
      }
    } catch (error) {
      console.error("Error getting permission status:", error);
      return "denied";
    }
  }
}
