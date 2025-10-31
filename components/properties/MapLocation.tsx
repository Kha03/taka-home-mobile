import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

interface MapLocationProps {
  mapLocation: string; // Format: "latitude,longitude"
}

/**
 * MapLocation Component
 * Hiển thị bản đồ interactive với marker tại vị trí property
 */
export default function MapLocation({ mapLocation }: MapLocationProps) {
  const { coordinates, isValid } = useMemo(() => {
    const [latitude, longitude] = mapLocation
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    return {
      coordinates: { latitude, longitude },
      isValid: !isNaN(latitude) && !isNaN(longitude),
    };
  }, [mapLocation]);

  if (!isValid) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#f59e0b" />
        <Text style={styles.errorTitle}>Tọa độ không hợp lệ</Text>
        <Text style={styles.errorText}>Format cần: "latitude,longitude"</Text>
        <Text style={styles.errorText}>Nhận được: {mapLocation}</Text>
      </View>
    );
  }

  const { latitude, longitude } = coordinates;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor="#3b82f6"
        loadingBackgroundColor="#f3f4f6"
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Vị trí bất động sản"
          description={`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
          pinColor="#ef4444"
        />
      </MapView>

      {/* Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#7f1d1d",
    textAlign: "center",
    marginTop: 4,
  },
  attribution: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: "#6b7280",
  },
});
