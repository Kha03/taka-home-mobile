import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomToastProps {
  text1?: string;
  text2?: string;
  type: "success" | "error" | "info" | "warning";
}

export const CustomToast = ({ text1, text2, type }: CustomToastProps) => {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "info":
      case "warning":
        return "information-circle";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "info":
        return "#fba31d";
      case "warning":
        return "#f59e0b";
      default:
        return "#fba31d";
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "info":
        return "#fba31d";
      case "warning":
        return "#f59e0b";
      default:
        return "#fba31d";
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getBorderColor() }]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIconName() as any}
          size={20}
          color={getIconColor()}
        />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  text2: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },
});
