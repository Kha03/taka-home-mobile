import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/signin");
  };

  const menuItems = [
    {
      id: "personal-info",
      icon: "person-outline",
      title: "Thông tin cá nhân",
      subtitle: "Cập nhật thông tin của bạn",
      onPress: () => {
        // TODO: Navigate to personal info screen
      },
    },
    {
      id: "wallet",
      icon: "account-balance-wallet",
      title: "Ví của tôi",
      subtitle: "Quản lý số dù và giao dịch",
      onPress: () => {
        router.push("/wallet");
      },
    },
    {
      id: "blockchain-history",
      icon: "history",
      title: "Lịch sử Blockchain",
      subtitle: "Xem các giao dịch blockchain",
      onPress: () => {
        // TODO: Navigate to blockchain history screen
      },
    },
    {
      id: "notifications",
      icon: "notifications-none",
      title: "Thông báo",
      subtitle: "Cài đặt thông báo",
      onPress: () => {
        // TODO: Navigate to notifications screen
      },
    },
    {
      id: "settings",
      icon: "settings",
      title: "Cài đặt",
      subtitle: "Tùy chỉnh ứng dụng",
      onPress: () => {
        // TODO: Navigate to settings screen
      },
    },
    {
      id: "help",
      icon: "help-outline",
      title: "Trợ giúp & Hỗ trợ",
      subtitle: "Liên hệ với chúng tôi",
      onPress: () => {
        // TODO: Navigate to help screen
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={40} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.fullName || "Người dùng"}
            </Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            {user?.phone && (
              <Text style={styles.userPhone}>
                <MaterialIcons name="phone" size={14} color="#666" />{" "}
                {user.phone}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color="#007AFF"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
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
  content: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: "#666",
  },
  editButton: {
    padding: 8,
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 24,
    marginBottom: 32,
  },
});
