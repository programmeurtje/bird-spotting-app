import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useSettings } from "../hooks/useSettings";
import { useNotifications } from "../hooks/useNotifications";
import { WaarnemingAPI } from "../services/WaarnemingAPI";
import { RootStackParamList } from "../types/navigation";
import { Colors } from "../constants/colors";

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, loading, error, updateSetting } = useSettings();

  const {
    permission: notificationPermission,
    requestPermissions: requestNotificationPermissions,
  } = useNotifications();

  const radiusOptions = [
    { label: "1 km", value: 1 },
    { label: "2 km", value: 2 },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "20 km", value: 20 },
  ];

  const handleNotificationToggle = async () => {
    if (
      !settings.notificationsEnabled &&
      notificationPermission !== "granted"
    ) {
      // If trying to enable notifications but no permission, request it first
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Geen Permissie",
          "Notificaties kunnen niet worden ingeschakeld zonder permissie. Ga naar instellingen om dit te wijzigen."
        );
        return;
      }
    }

    try {
      await updateSetting(
        "notificationsEnabled",
        !settings.notificationsEnabled
      );
    } catch (err) {
      Alert.alert("Fout", "Kon notificatie instelling niet wijzigen.");
    }
  };

  const handleRadiusChange = (radius: number) => {
    Alert.alert(
      "Zoekradius Wijzigen",
      `Wil je de zoekradius wijzigen naar ${radius} km?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Wijzigen",
          onPress: async () => {
            try {
              await updateSetting("searchRadius", radius);
            } catch (err) {
              Alert.alert("Fout", "Kon zoekradius niet wijzigen.");
            }
          },
        },
      ]
    );
  };

  const handleRarebirdsToggle = async () => {
    try {
      await updateSetting("rarebirdsOnly", !settings.rarebirdsOnly);
    } catch (err) {
      Alert.alert("Fout", "Kon instelling niet wijzigen.");
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Instellingen Resetten",
      "Weet je zeker dat je alle instellingen wilt resetten naar de standaardwaarden?",
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Reset to default values
              await updateSetting("notificationsEnabled", true);
              await updateSetting("searchRadius", 2);
              await updateSetting("rarebirdsOnly", false);
              await updateSetting("minRarityLevel", 0);
              await updateSetting("notificationMinRarity", 3);
              Alert.alert(
                "Gereset",
                "Instellingen zijn gereset naar standaardwaarden."
              );
            } catch (err) {
              Alert.alert("Fout", "Kon instellingen niet resetten.");
            }
          },
        },
      ]
    );
  };

  const handleMinRarityChange = (level: number) => {
    const rarityLevel = WaarnemingAPI.getRarityLevel(level);
    Alert.alert(
      "Filter Wijzigen",
      `Wil je alleen vogels tonen die "${rarityLevel.name}" of zeldzamer zijn?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Wijzigen",
          onPress: async () => {
            try {
              await updateSetting("minRarityLevel", level);
            } catch (err) {
              Alert.alert("Fout", "Kon filter niet wijzigen.");
            }
          },
        },
      ]
    );
  };

  const handleNotificationRarityChange = (level: number) => {
    const rarityLevel = WaarnemingAPI.getRarityLevel(level);
    Alert.alert(
      "Notificatie Filter Wijzigen",
      `Wil je alleen notificaties ontvangen voor vogels die "${rarityLevel.name}" of zeldzamer zijn?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Wijzigen",
          onPress: async () => {
            try {
              await updateSetting("notificationMinRarity", level);
            } catch (err) {
              Alert.alert("Fout", "Kon notificatie filter niet wijzigen.");
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    if (notificationPermission !== "granted") {
      Alert.alert(
        "Geen Permissie",
        "Sta eerst notificaties toe om een test te versturen."
      );
      return;
    }

    Alert.alert(
      "Test Notificatie",
      "✅ Test notificatie functionaliteit is vereenvoudigd!"
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Instellingen laden...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="notifications"
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.sectionTitle}>Notificaties</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notificaties inschakelen</Text>
            <Text style={styles.settingDescription}>
              Ontvang meldingen voor zeldzame vogelwaarnemingen
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: Colors.divider, true: Colors.primary }}
            thumbColor={
              settings.notificationsEnabled ? Colors.surface : Colors.background
            }
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Alleen zeldzame vogels</Text>
            <Text style={styles.settingDescription}>
              Alleen notificaties voor bijzondere soorten
            </Text>
          </View>
          <Switch
            value={settings.rarebirdsOnly}
            onValueChange={handleRarebirdsToggle}
            trackColor={{ false: Colors.divider, true: Colors.primary }}
            thumbColor={
              settings.rarebirdsOnly ? Colors.surface : Colors.background
            }
            disabled={!settings.notificationsEnabled}
          />
        </View>

        {settings.notificationsEnabled && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.testButtonText}>
              Test Notificatie Versturen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="search" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Zoeken</Text>
        </View>

        <View style={styles.settingColumn}>
          <Text style={styles.settingLabel}>Zoekradius</Text>
          <Text style={styles.settingDescription}>
            Hoe ver om je heen moet er gezocht worden naar vogels?
          </Text>

          <View style={styles.radiusOptions}>
            {radiusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radiusOption,
                  settings.searchRadius === option.value &&
                    styles.radiusOptionSelected,
                ]}
                onPress={() => handleRadiusChange(option.value)}
              >
                <Text
                  style={[
                    styles.radiusOptionText,
                    settings.searchRadius === option.value &&
                      styles.radiusOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Rarity Filter Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="filter-list" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Zeldzaamheid Filter</Text>
        </View>

        <View style={styles.settingColumn}>
          <Text style={styles.settingLabel}>Toon vogels vanaf</Text>
          <Text style={styles.settingDescription}>
            Welke zeldzaamheid wil je minimaal zien in het overzicht?
          </Text>

          <View style={styles.rarityOptions}>
            {WaarnemingAPI.getRarityLevels().map((rarity) => (
              <TouchableOpacity
                key={rarity.id}
                style={[
                  styles.rarityOption,
                  { borderColor: rarity.color },
                  settings.minRarityLevel === rarity.id &&
                    styles.rarityOptionSelected,
                  settings.minRarityLevel === rarity.id && {
                    backgroundColor: rarity.color,
                  },
                ]}
                onPress={() => handleMinRarityChange(rarity.id)}
              >
                <View
                  style={[
                    styles.rarityIndicator,
                    { backgroundColor: rarity.color },
                  ]}
                />
                <Text
                  style={[
                    styles.rarityOptionText,
                    settings.minRarityLevel === rarity.id &&
                      styles.rarityOptionTextSelected,
                  ]}
                >
                  {rarity.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingColumn}>
          <Text style={styles.settingLabel}>Notificaties vanaf</Text>
          <Text style={styles.settingDescription}>
            Voor welke zeldzaamheid wil je notificaties ontvangen?
          </Text>

          <View style={styles.rarityOptions}>
            {WaarnemingAPI.getRarityLevels()
              .filter((rarity) => rarity.id >= 2) // Only show "vrij algemeen" and rarer
              .map((rarity) => (
                <TouchableOpacity
                  key={rarity.id}
                  style={[
                    styles.rarityOption,
                    { borderColor: rarity.color },
                    settings.notificationMinRarity === rarity.id &&
                      styles.rarityOptionSelected,
                    settings.notificationMinRarity === rarity.id && {
                      backgroundColor: rarity.color,
                    },
                  ]}
                  onPress={() => handleNotificationRarityChange(rarity.id)}
                  disabled={!settings.notificationsEnabled}
                >
                  <View
                    style={[
                      styles.rarityIndicator,
                      { backgroundColor: rarity.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.rarityOptionText,
                      settings.notificationMinRarity === rarity.id &&
                        styles.rarityOptionTextSelected,
                      !settings.notificationsEnabled && styles.disabledText,
                    ]}
                  >
                    {rarity.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="info" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>App Info</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Zoekradius:</Text>
          <Text style={styles.infoValue}>{settings.searchRadius} km</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Toon vogels vanaf:</Text>
          <Text style={styles.infoValue}>
            {WaarnemingAPI.getRarityLevel(settings.minRarityLevel).name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Notificaties vanaf:</Text>
          <Text style={styles.infoValue}>
            {WaarnemingAPI.getRarityLevel(settings.notificationMinRarity).name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Notificatie status:</Text>
          <View style={styles.permissionStatus}>
            <MaterialIcons
              name={getPermissionIcon(notificationPermission)}
              size={16}
              color={getPermissionColor(notificationPermission)}
            />
            <Text
              style={[
                styles.infoValue,
                { color: getPermissionColor(notificationPermission) },
              ]}
            >
              {getPermissionText(notificationPermission)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Laatst bijgewerkt:</Text>
          <Text style={styles.infoValue}>
            {new Date(settings.lastUpdated).toLocaleString("nl-NL")}
          </Text>
        </View>
      </View>

      {/* Reset Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Text style={styles.resetButtonText}>Instellingen Resetten</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getPermissionText = (permission: string) => {
  switch (permission) {
    case "granted":
      return "Toegestaan";
    case "denied":
      return "Geweigerd";
    case "pending":
      return "Wachtend";
    default:
      return "Onbekend";
  }
};

const getPermissionIcon = (permission: string) => {
  switch (permission) {
    case "granted":
      return "check-circle";
    case "denied":
      return "cancel";
    case "pending":
      return "schedule";
    default:
      return "help";
  }
};

const getPermissionColor = (permission: string) => {
  switch (permission) {
    case "granted":
      return Colors.success;
    case "denied":
      return Colors.error;
    case "pending":
      return Colors.warning;
    default:
      return Colors.textMuted;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textTertiary,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingColumn: {
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  testButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  radiusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  radiusOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  radiusOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radiusOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textTertiary,
  },
  radiusOptionTextSelected: {
    color: Colors.surface,
  },
  rarityOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  rarityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    minWidth: 100,
  },
  rarityOptionSelected: {
    // backgroundColor will be set dynamically based on rarity color
  },
  rarityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  rarityOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textTertiary,
    flex: 1,
  },
  rarityOptionTextSelected: {
    color: Colors.surface,
    fontWeight: "600",
  },
  disabledText: {
    color: Colors.textMuted,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textTertiary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "right",
    flex: 1,
  },
  permissionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
  },
  resetButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
