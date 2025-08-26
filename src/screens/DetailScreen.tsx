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
import { MaterialIcons } from "@expo/vector-icons";
import { Observation } from "../types";
import { RootStackParamList } from "../types/navigation";
import { Colors } from "../constants/colors";

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
        <View style={styles.sectionHeader}>
          <MaterialIcons name="schedule" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Wanneer</Text>
        </View>
        <Text style={styles.sectionContent}>
          {formatDate(observation.date)}
        </Text>
        <Text style={styles.sectionSubContent}>
          om {formatTime(observation.date)}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="place" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Waar</Text>
        </View>
        <Text style={styles.sectionContent}>{observation.location.name}</Text>
        {observation.distance && (
          <Text style={styles.sectionSubContent}>
            {observation.distance.toFixed(1)} km van jouw locatie
          </Text>
        )}

        <TouchableOpacity style={styles.mapButton} onPress={handleShowOnMap}>
          <MaterialIcons
            name="map"
            size={16}
            color="#fff"
            style={styles.mapButtonIcon}
          />
          <Text style={styles.mapButtonText}>Toon op kaart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="person" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Waarnemer</Text>
        </View>
        <Text style={styles.sectionContent}>{observation.observer}</Text>
      </View>

      {observation.species.photo_url && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="photo" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Foto</Text>
          </View>
          <Text style={styles.sectionSubContent}>
            Foto beschikbaar (wordt in volgende versie getoond)
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="info" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Details</Text>
        </View>
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: "italic",
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sectionContent: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  sectionSubContent: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 4,
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapButtonIcon: {
    marginRight: 2,
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
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textTertiary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: "monospace",
    flex: 1,
    textAlign: "right",
  },
});
