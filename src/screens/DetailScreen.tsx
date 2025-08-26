import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Observation } from "../types";
import { RootStackParamList } from "../types/navigation";

type DetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Detail"
>;
type DetailScreenRouteProp = RouteProp<RootStackParamList, "Detail">;

interface Props {
  navigation: DetailScreenNavigationProp;
  route: DetailScreenRouteProp;
}

export const DetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { observation } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShowOnMap = () => {
    const { lat, lng, name } = observation.location;
    const label = encodeURIComponent(`${observation.species.name} - ${name}`);

    // Create map URLs for different platforms
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${label}&ll=${lat},${lng}&z=16`;

    Alert.alert(
      "Kaart Openen",
      `Toon de locatie van ${observation.species.name} op de kaart?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: Platform.OS === "ios" ? "Apple Maps" : "Google Maps",
          onPress: () => {
            const url = Platform.OS === "ios" ? appleMapsUrl : googleMapsUrl;
            Linking.openURL(url).catch((err) => {
              console.error("Error opening map:", err);
              Alert.alert(
                "Fout",
                "Kon de kaart app niet openen. Controleer of je een kaart app hebt geïnstalleerd."
              );
            });
          },
        },
        ...(Platform.OS === "ios"
          ? [
              {
                text: "Google Maps",
                onPress: () => {
                  Linking.openURL(googleMapsUrl).catch((err) => {
                    console.error("Error opening Google Maps:", err);
                    Alert.alert(
                      "Fout",
                      "Kon Google Maps niet openen. Is de app geïnstalleerd?"
                    );
                  });
                },
              },
            ]
          : []),
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.birdNameContainer}>
            <Text style={styles.birdName}>{observation.species.name}</Text>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: observation.rarity.color },
              ]}
            >
              <Text style={styles.rarityEmoji}>{observation.rarity.emoji}</Text>
            </View>
          </View>
        </View>
        {observation.species.scientific_name && (
          <Text style={styles.scientificName}>
            {observation.species.scientific_name}
          </Text>
        )}
        <Text style={styles.rarityText}>
          {observation.rarity.name.charAt(0).toUpperCase() +
            observation.rarity.name.slice(1)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Wanneer</Text>
        <Text style={styles.sectionContent}>
          {formatDate(observation.date)}
        </Text>
        <Text style={styles.sectionSubContent}>
          om {formatTime(observation.date)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Waar</Text>
        <Text style={styles.sectionContent}>{observation.location.name}</Text>
        {observation.distance && (
          <Text style={styles.sectionSubContent}>
            {observation.distance.toFixed(1)} km van jouw locatie
          </Text>
        )}

        <TouchableOpacity style={styles.mapButton} onPress={handleShowOnMap}>
          <Text style={styles.mapButtonText}>Toon op kaart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Waarnemer</Text>
        <Text style={styles.sectionContent}>{observation.observer}</Text>
      </View>

      {observation.species.photo_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Foto</Text>
          <Text style={styles.sectionSubContent}>
            Foto beschikbaar (wordt in volgende versie getoond)
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Waarneming ID:</Text>
          <Text style={styles.detailValue}>{observation.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Soort ID:</Text>
          <Text style={styles.detailValue}>{observation.species.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Coördinaten:</Text>
          <Text style={styles.detailValue}>
            {observation.location.lat.toFixed(4)},{" "}
            {observation.location.lng.toFixed(4)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTop: {
    marginBottom: 8,
  },
  birdNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  birdName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    marginRight: 12,
  },
  rarityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rarityEmoji: {
    fontSize: 16,
  },
  rarityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginTop: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#6c757d",
    marginBottom: 4,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: "#212529",
    lineHeight: 24,
  },
  sectionSubContent: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6c757d",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#212529",
    fontFamily: "monospace",
    flex: 1,
    textAlign: "right",
  },
});
