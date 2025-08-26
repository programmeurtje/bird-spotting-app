import React from "react";
import { View, StyleSheet } from "react-native";
import { APITest } from "../components/APITest";

export const TestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <APITest />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
});
