import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MapLocationProps {
  mapLocation: string; // Format: 'latitude,longitude'
}

export default function MapLocation({ mapLocation }: MapLocationProps) {
  const mapContainer = useRef<View>(null);

  useEffect(() => {
    if (!mapLocation) return;

    // Parse coordinates
    const [latitude, longitude] = mapLocation
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("Invalid coordinates format");
      return;
    }

    // For React Native, we would need to use react-native-maps
    // For now, we'll show a placeholder
    console.log("Map coordinates:", { latitude, longitude });
  }, [mapLocation]);

  if (!mapLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="location" size={16} color="#3b82f6" />
          <Text style={styles.title}>Vị trí bất động sản trên bản đồ</Text>
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Không có thông tin vị trí</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location" size={16} color="#3b82f6" />
        <Text style={styles.title}>Vị trí bất động sản trên bản đồ</Text>
      </View>
      <View style={styles.mapContainer} ref={mapContainer}>
        {/* TODO: Implement react-native-maps here */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Bản đồ sẽ được hiển thị ở đây
          </Text>
          <Text style={styles.coordinatesText}>Tọa độ: {mapLocation}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  mapContainer: {
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  placeholderText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  coordinatesText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
});
