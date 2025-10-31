import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function MyPropertiesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"published" | "draft">(
    "published"
  );
  const router = useRouter();

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Load my properties data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddProperty = () => {
    // TODO: Navigate to add property screen
    console.log("Add new property");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bất động sản của tôi</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "published" && styles.activeTab]}
          onPress={() => setActiveTab("published")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "published" && styles.activeTabText,
            ]}
          >
            Đã đăng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "draft" && styles.activeTab]}
          onPress={() => setActiveTab("draft")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "draft" && styles.activeTabText,
            ]}
          >
            Nháp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="business" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === "published"
                ? "Bạn chưa đăng bất động sản nào"
                : "Chưa có bản nháp nào"}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "published"
                ? "Nhấn nút + để đăng bất động sản mới"
                : "Các bản nháp chưa hoàn thành sẽ hiển thị ở đây"}
            </Text>
            {activeTab === "published" && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddProperty}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Đăng tin mới</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fba31d",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    borderBottomColor: "#fba31d",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#fba31d",
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
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
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fba31d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
