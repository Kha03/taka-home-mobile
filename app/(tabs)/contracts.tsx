import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ContractsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const router = useRouter();

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Load contracts data
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hợp đồng của tôi</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Còn hiệu lực
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "expired" && styles.activeTab]}
          onPress={() => setActiveTab("expired")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expired" && styles.activeTabText,
            ]}
          >
            Hết hiệu lực
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="description" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {activeTab === "active"
              ? "Bạn chưa có hợp đồng nào đang hiệu lực"
              : "Chưa có hợp đồng hết hiệu lực"}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === "active"
              ? "Hợp đồng sẽ xuất hiện khi bạn thuê hoặc cho thuê bất động sản"
              : "Các hợp đồng đã kết thúc hoặc bị hủy sẽ hiển thị ở đây"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
