import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocation } from "../hooks/useLocation";
import { useObservations } from "../hooks/useObservations";
import { useNotifications } from "../hooks/useNotifications";
import { useSettings } from "../hooks/useSettings";
import { Observation } from "../types";
import { RootStackParamList } from "../types/navigation";
import { Colors } from "../constants/colors";

interface BirdListItemProps {
  observation: Observation;
  onPress: (observation: Observation) => void;
}

const BirdListItem: React.FC<BirdListItemProps> = ({
  observation,
  onPress,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Vandaag";
    if (diffDays === 2) return "Gisteren";
    if (diffDays <= 7) return `${diffDays - 1} dagen geleden`;
    return date.toLocaleDateString("nl-NL");
  };

  return (
    <TouchableOpacity
      style={styles.birdItem}
      onPress={() => onPress(observation)}
    >
      <View style={styles.birdHeader}>
        <View style={styles.birdNameContainer}>
          <Text style={styles.birdName} numberOfLines={1}>
            {observation.species.name}
          </Text>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: observation.rarity.color },
            ]}
          />
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distance}>
            {observation.distance?.toFixed(1)}km
          </Text>
        </View>
      </View>

      {observation.species.scientific_name && (
        <Text style={styles.scientificName} numberOfLines={1}>
          {observation.species.scientific_name}
        </Text>
      )}

      <View style={styles.birdDetails}>
        <Text style={styles.date}>{formatDate(observation.date)}</Text>
        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={14} color={Colors.textTertiary} />
          <Text style={styles.location} numberOfLines={1}>
            {observation.location.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
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
    checkRareBirds,
  } = useNotifications();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Auto-fetch location on mount
  useEffect(() => {
    if (!location && !locationLoading) {
      requestLocation();
    }
  }, [location, locationLoading, requestLocation]);

  // Request notification permissions on mount
  useEffect(() => {
    if (notificationPermission === "pending") {
      requestNotificationPermissions();
    }
  }, [notificationPermission, requestNotificationPermissions]);

  // Reset hasFetched when location or radius changes
  useEffect(() => {
    if (location) {
      setHasFetched(false);
    }
  }, [location?.latitude, location?.longitude, settings.searchRadius]);

  // Auto-fetch observations when location is available
  useEffect(() => {
    if (location && !obsLoading && !hasFetched) {
      fetchObservations(location, settings.searchRadius).then(() => {
        setHasFetched(true);
      });
    }
  }, [
    location,
    obsLoading,
    hasFetched,
    fetchObservations,
    settings.searchRadius,
  ]);

  // Check for rare birds when observations change
  useEffect(() => {
    if (
      observations.length > 0 &&
      settings.notificationsEnabled &&
      notificationPermission === "granted"
    ) {
      console.log(
        "🔍 Checking for rare birds in",
        observations.length,
        "observations with min rarity:",
        settings.notificationMinRarity
      );
      checkRareBirds(observations, settings.notificationMinRarity);
    }
  }, [
    observations,
    settings.notificationsEnabled,
    settings.notificationMinRarity,
    notificationPermission,
    checkRareBirds,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (location) {
        await fetchObservations(location, settings.searchRadius);
      } else {
        await requestLocation();
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBirdPress = (observation: Observation) => {
    navigation.navigate("Detail", { observation });
  };

  const handleLocationRequest = async () => {
    await requestLocation();
  };

  const handleFetchBirds = async () => {
    if (location) {
      await fetchObservations(location, settings.searchRadius);
    }
  };

  const renderEmptyState = () => {
    if (locationLoading || obsLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyStateText}>
            {locationLoading ? "Locatie ophalen..." : "Vogels zoeken..."}
          </Text>
        </View>
      );
    }

    if (locationError || !location) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="location-on"
            size={48}
            color={Colors.textMuted}
          />
          <Text style={styles.emptyStateTitle}>Locatie Nodig</Text>
          <Text style={styles.emptyStateText}>
            We hebben je locatie nodig om vogels in de buurt te vinden.
          </Text>
          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLocationRequest}
          >
            <Text style={styles.actionButtonText}>Locatie Toestaan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (obsError) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="warning" size={48} color={Colors.error} />
          <Text style={styles.emptyStateTitle}>Fout</Text>
          <Text style={styles.errorText}>{obsError}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFetchBirds}
          >
            <Text style={styles.actionButtonText}>Opnieuw Proberen</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (observations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="search" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyStateTitle}>Geen Vogels Gevonden</Text>
          <Text style={styles.emptyStateText}>
            Er zijn geen vogelwaarnemingen gevonden in de afgelopen week binnen{" "}
            {settings.searchRadius}km van je locatie.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFetchBirds}
          >
            <Text style={styles.actionButtonText}>Opnieuw Zoeken</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Vogels in de Buurt</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <MaterialIcons
                name="settings"
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate("Test")}
            >
              <MaterialIcons
                name="science"
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
        {location && (
          <Text style={styles.subtitle}>
            Binnen {settings.searchRadius}km •{" "}
            {
              observations.filter(
                (obs) => obs.rarity.id >= settings.minRarityLevel
              ).length
            }{" "}
            {settings.minRarityLevel > 0 ? `gefilterde ` : ""}waarnemingen
            {settings.minRarityLevel > 0 &&
              observations.length >
                observations.filter(
                  (obs) => obs.rarity.id >= settings.minRarityLevel
                ).length &&
              ` (${observations.length} totaal)`}
          </Text>
        )}
      </View>

      {/* Bird List */}
      <FlatList
        data={observations.filter(
          (obs) => obs.rarity.id >= settings.minRarityLevel
        )}
        renderItem={({ item }) => (
          <BirdListItem observation={item} onPress={handleBirdPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={
          observations.filter((obs) => obs.rarity.id >= settings.minRarityLevel)
            .length === 0
            ? styles.listEmpty
            : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listEmpty: {
    flexGrow: 1,
  },
  birdItem: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  birdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  birdNameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  birdName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  rarityBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distanceContainer: {
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distance: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.surface,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  birdDetails: {
    gap: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textTertiary,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: Colors.warning,
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
