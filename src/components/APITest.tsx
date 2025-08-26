import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { useLocation } from "../hooks/useLocation";
import { useObservations } from "../hooks/useObservations";
import { useNotifications } from "../hooks/useNotifications";
import { WaarnemingAPI } from "../services/WaarnemingAPI";
import { Observation } from "../types";

export const APITest: React.FC = () => {
  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useLocation();
  const {
    observations,
    loading: obsLoading,
    error: obsError,
    fetchObservations,
  } = useObservations();
  const {
    permission: notificationPermission,
    requestPermissions: requestNotificationPermissions,
  } = useNotifications();

  const handleFetchObservations = async () => {
    if (!location) {
      Alert.alert(
        "Geen Locatie",
        "Vraag eerst je locatie op voordat je vogels kunt zoeken."
      );
      return;
    }

    await fetchObservations(location, 2);
  };

  const handleTestConnection = async () => {
    console.log("🔍 Testing API connection...");
    const isConnected = await WaarnemingAPI.testConnection();
    Alert.alert(
      "API Test",
      isConnected
        ? "✅ API verbinding succesvol!"
        : "❌ Geen werkende API gevonden. Check de console voor details."
    );
  };

  const handleTestNotifications = async () => {
    if (notificationPermission !== "granted") {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert("Geen Permissie", "Notificaties zijn geweigerd.");
        return;
      }
    }

    Alert.alert(
      "Test Notificatie",
      "Test notificatie functionaliteit is vereenvoudigd!"
    );
  };

  const renderObservation = ({ item }: { item: Observation }) => (
    <View style={styles.observationItem}>
      <View style={styles.observationHeader}>
        <Text style={styles.birdName}>{item.species.name}</Text>
        <Text style={styles.distance}>{item.distance?.toFixed(1)}km</Text>
      </View>

      {item.species.scientific_name && (
        <Text style={styles.scientificName}>
          {item.species.scientific_name}
        </Text>
      )}

      <View style={styles.observationDetails}>
        <Text style={styles.date}>
          📅 {new Date(item.date).toLocaleDateString("nl-NL")}
        </Text>
        <Text style={styles.location}>📍 {item.location.name}</Text>
        <Text style={styles.observer}>👤 {item.observer}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Development Test</Text>

      {/* Status Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Locatie</Text>
            <Text
              style={[
                styles.statusValue,
                { color: location ? "#27ae60" : "#e74c3c" },
              ]}
            >
              {location ? "✅" : "❌"}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>API</Text>
            <Text
              style={[
                styles.statusValue,
                { color: observations.length > 0 ? "#27ae60" : "#f39c12" },
              ]}
            >
              {observations.length > 0 ? "✅" : "⏳"}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Notificaties</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    notificationPermission === "granted"
                      ? "#27ae60"
                      : "#e74c3c",
                },
              ]}
            >
              {notificationPermission === "granted" ? "✅" : "❌"}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.smallButton,
              locationLoading && styles.buttonDisabled,
            ]}
            onPress={requestLocation}
            disabled={locationLoading}
          >
            <Text style={styles.buttonText}>
              {locationLoading ? "..." : "📍 Locatie"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.smallButton]}
            onPress={handleTestConnection}
          >
            <Text style={styles.buttonText}>🔗 API Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.smallButton]}
            onPress={handleTestNotifications}
          >
            <Text style={styles.buttonText}>🔔 Notificatie</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.fullButton,
            (obsLoading || !location) && styles.buttonDisabled,
          ]}
          onPress={handleFetchObservations}
          disabled={obsLoading || !location}
        >
          <Text style={styles.buttonText}>
            {obsLoading
              ? "Vogels Zoeken..."
              : `🐦 Zoek Vogels (${observations.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Location */}
      {location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Huidige Locatie</Text>
          <Text style={styles.locationText}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Errors */}
      {(locationError || obsError) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Errors</Text>
          {locationError && (
            <Text style={styles.errorText}>Locatie: {locationError}</Text>
          )}
          {obsError && <Text style={styles.errorText}>API: {obsError}</Text>}
        </View>
      )}

      {/* Recent Results */}
      {observations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Laatste Resultaten ({observations.length})
          </Text>

          <FlatList
            data={observations.slice(0, 3)}
            renderItem={renderObservation}
            keyExtractor={(item) => item.id.toString()}
            style={styles.observationsList}
            showsVerticalScrollIndicator={false}
          />
          {observations.length > 3 && (
            <Text style={styles.moreResults}>
              ... en nog {observations.length - 3} andere
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#27ae60",
    marginBottom: 10,
  },
  noLocationText: {
    fontSize: 14,
    color: "#e74c3c",
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 10,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#ffeaa7",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
  },
  fullButton: {
    width: "100%",
  },
  resultsSection: {
    marginTop: 10,
  },
  observationsList: {
    maxHeight: 300,
  },
  observationItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#27ae60",
  },
  observationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  birdName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  scientificName: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#7f8c8d",
    marginBottom: 6,
  },
  observationDetails: {
    gap: 2,
  },
  date: {
    fontSize: 12,
    color: "#34495e",
  },
  location: {
    fontSize: 12,
    color: "#34495e",
  },
  observer: {
    fontSize: 12,
    color: "#34495e",
  },
  moreResults: {
    textAlign: "center",
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
    marginTop: 10,
  },
});
