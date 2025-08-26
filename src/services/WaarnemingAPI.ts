import axios from "axios";
import {
  Observation,
  ObservationParams,
  LocationCoordinates,
  RarityLevel,
} from "../types";

const BASE_URL = "https://waarneming.nl/api/v1";

// Rarity levels mapping based on API response
const RARITY_LEVELS: Record<number, RarityLevel> = {
  0: { id: 0, name: "onbekend", color: "#95a5a6", emoji: "" },
  1: { id: 1, name: "algemeen", color: "#27ae60", emoji: "" },
  2: { id: 2, name: "vrij algemeen", color: "#f39c12", emoji: "" },
  3: { id: 3, name: "zeldzaam", color: "#e67e22", emoji: "" },
  4: { id: 4, name: "zeer zeldzaam", color: "#e74c3c", emoji: "" },
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Simple interfaces for API response parsing
interface APIPoint {
  coordinates: [number, number]; // [lng, lat]
}

interface APISpeciesDetail {
  id: number;
  name: string;
  scientific_name?: string;
}

interface APILocationDetail {
  name: string;
}

export class WaarnemingAPI {
  /**
   * Get available rarity levels
   */
  static getRarityLevels(): RarityLevel[] {
    return Object.values(RARITY_LEVELS);
  }

  /**
   * Get rarity level by ID
   */
  static getRarityLevel(id: number): RarityLevel {
    return RARITY_LEVELS[id] || RARITY_LEVELS[0];
  }
  /**
   * Fetch bird observations from waarneming.nl API
   * Based on working Postman request: /observations/around-point/
   */
  static async getObservations(
    params: ObservationParams
  ): Promise<Observation[]> {
    try {
      return await this.getRealObservations(params);
    } catch (error) {
      console.log(
        "API failed, using mock data:",
        error instanceof Error ? error.message : error
      );
      return this.getMockObservations(params);
    }
  }

  /**
   * Fetch real observations from waarneming.nl API
   * Using the exact endpoint that works in Postman
   */
  private static async getRealObservations(
    params: ObservationParams
  ): Promise<Observation[]> {
    const endpoint = `${BASE_URL}/observations/around-point/`;

    // Build query parameters exactly like the working Postman request
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      radius: (params.radius_km * 1000).toString(), // Convert km to meters
      species_group: "1", // Birds group ID
      days: "1", // Last 1 day
      end_date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    });

    const url = `${endpoint}?${queryParams}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "User-Agent": "BirdSpottingApp/1.0",
      },
    });

    // Parse the response based on waarneming.nl API structure
    if (response.data?.results && Array.isArray(response.data.results)) {
      return this.parseObservations(response.data.results, params);
    } else if (response.data && Array.isArray(response.data)) {
      return this.parseObservations(response.data, params);
    } else {
      throw new Error("Unexpected API response format");
    }
  }

  /**
   * Mock observations for testing when API is unavailable
   */
  private static getMockObservations(params: ObservationParams): Observation[] {
    const mockObservations: Observation[] = [
      {
        id: 1,
        species: {
          id: 101,
          name: "Merel",
          scientific_name: "Turdus merula",
        },
        date: new Date().toISOString(),
        location: {
          lat: params.lat + 0.005,
          lng: params.lng + 0.005,
          name: "Griftpark Utrecht",
        },
        observer: "Jan de Vogelvriend",
        distance: 0.8,
        rarity: RARITY_LEVELS[1], // algemeen
      },
      {
        id: 2,
        species: {
          id: 102,
          name: "Roodborst",
          scientific_name: "Erithacus rubecula",
        },
        date: new Date().toISOString(),
        location: {
          lat: params.lat - 0.003,
          lng: params.lng + 0.008,
          name: "Wilhelminapark Utrecht",
        },
        observer: "Maria Natuurliefhebber",
        distance: 1.2,
        rarity: RARITY_LEVELS[2], // vrij algemeen
      },
      {
        id: 3,
        species: {
          id: 103,
          name: "Koolmees",
          scientific_name: "Parus major",
        },
        date: new Date().toISOString(),
        location: {
          lat: params.lat + 0.008,
          lng: params.lng - 0.002,
          name: "Maximapark Leidsche Rijn",
        },
        observer: "Piet de Vogelaar",
        distance: 1.5,
        rarity: RARITY_LEVELS[1], // algemeen
      },
    ];

    return mockObservations
      .filter((obs) => (obs.distance || 0) <= params.radius_km)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Parse observations from waarneming.nl API response
   */
  private static parseObservations(
    data: any[],
    params: ObservationParams
  ): Observation[] {
    return data
      .map((item: any, index: number) => {
        // Extract coordinates from point object
        const lat = item.point?.coordinates?.[1] || 0;
        const lng = item.point?.coordinates?.[0] || 0;
        const distance = calculateDistance(params.lat, params.lng, lat, lng);

        // Extract species information from species_detail
        const speciesName =
          item.species_detail?.name || `Onbekende vogel ${index + 1}`;
        const scientificName = item.species_detail?.scientific_name || "";
        const speciesId = item.species_detail?.id || index + 100;

        // Extract location information from location_detail
        const locationName = item.location_detail?.name || "Onbekende locatie";

        // Build date string from date and time
        const dateTime = item.time
          ? `${item.date}T${item.time}:00`
          : `${item.date}T00:00:00`;

        // Get rarity information
        const rarityId = item.rarity || 0;
        const rarity = RARITY_LEVELS[rarityId] || RARITY_LEVELS[0];

        return {
          id: item.id || index + 1,
          species: {
            id: speciesId,
            name: speciesName,
            scientific_name: scientificName,
            photo_url: item.has_photo ? item.permalink : undefined,
          },
          date: dateTime,
          location: {
            lat,
            lng,
            name: locationName,
          },
          observer: `Waarnemer ${item.user}`, // User ID, we don't have the actual name
          distance: Math.round(distance * 100) / 100,
          rarity,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get recent observations within specified radius
   */
  static async getRecentObservations(
    location: LocationCoordinates,
    radiusKm: number = 2
  ): Promise<Observation[]> {
    const params: ObservationParams = {
      lat: location.latitude,
      lng: location.longitude,
      radius_km: radiusKm,
      date_from: new Date().toISOString().split("T")[0],
      date_to: new Date().toISOString().split("T")[0],
      species_group: "birds",
    };

    return this.getObservations(params);
  }

  /**
   * Test API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const testUrl = `${BASE_URL}/observations/around-point/?lat=52.0726&lng=5.0966&radius=1000&species_group=1&days=1&end_date=${
        new Date().toISOString().split("T")[0]
      }`;

      const response = await axios.get(testUrl, {
        timeout: 5000,
        headers: {
          Accept: "application/json",
          "User-Agent": "BirdSpottingApp/1.0",
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error("API connection failed:", error);
      return false;
    }
  }
}
