import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/lib/api";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }

    // Kiểm tra nếu số điện thoại không thay đổi
    if (formData.phone === user.phone) {
      Alert.alert("Thông báo", "Không có thay đổi nào để lưu");
      setIsEditing(false);
      return;
    }

    // Validate số điện thoại
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số");
      return;
    }

    try {
      setIsSaving(true);

      // Call API to update phone
      await authService.updateUserPhone(user.id, formData.phone);

      // Refresh user data from server
      await refreshUserData();

      Alert.alert("Thành công", "Cập nhật số điện thoại thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        (error as any)?.message ||
        "Không thể cập nhật thông tin. Vui lòng thử lại.";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  const InfoItem = ({
    icon,
    label,
    value,
    editable = false,
  }: {
    icon: string;
    label: string;
    value: string;
    editable?: boolean;
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <MaterialIcons name={icon as any} size={20} color="#666" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            const field =
              label === "Họ và tên"
                ? "fullName"
                : label === "Email"
                ? "email"
                : "phone";
            setFormData({ ...formData, [field]: text });
          }}
          placeholder={`Nhập ${label.toLowerCase()}`}
          placeholderTextColor="#999"
          editable={!isSaving}
          keyboardType={label === "Số điện thoại" ? "phone-pad" : "default"}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "Chưa cập nhật"}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Note - Chỉ được sửa số điện thoại */}
        {isEditing && (
          <View style={styles.noteContainer}>
            <MaterialIcons name="info-outline" size={20} color="#fba31d" />
            <Text style={styles.noteText}>
              Bạn chỉ có thể chỉnh sửa số điện thoại. Để thay đổi họ tên hoặc
              email, vui lòng liên hệ hỗ trợ.
            </Text>
          </View>
        )}

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <InfoItem
            icon="person"
            label="Họ và tên"
            value={formData.fullName}
            editable={false}
          />

          <InfoItem
            icon="email"
            label="Email"
            value={formData.email}
            editable={false}
          />

          <InfoItem
            icon="phone"
            label="Số điện thoại"
            value={formData.phone}
            editable={true}
          />
        </View>

        {/* CCCD Section - Chỉ hiển thị nếu đã xác thực */}
        {user?.CCCD && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin xác thực</Text>

            <View style={styles.cccdCard}>
              <View style={styles.cccdHeader}>
                <MaterialIcons name="verified-user" size={24} color="#4CAF50" />
                <Text style={styles.cccdTitle}>Đã xác thực CCCD</Text>
                <MaterialIcons name="verified" size={20} color="#4CAF50" />
              </View>

              <Text style={styles.cccdNote}>
                Tài khoản của bạn đã được xác thực với CCCD. Thông tin chi tiết
                được lưu trữ an toàn trong hệ thống.
              </Text>
            </View>
          </View>
        )}

        {/* Role Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vai trò</Text>
          <View style={styles.roleContainer}>
            {user?.roles?.map((role) => (
              <View key={role} style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {role === "TENANT"
                    ? "Người thuê"
                    : role === "LANDLORD"
                    ? "Chủ nhà"
                    : role}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {isEditing ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.editFullButton]}
            onPress={() => setIsEditing(true)}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.editFullButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "#fff7ed",
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fba31d",
    alignItems: "flex-start",
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 28,
  },
  input: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
  },
  cccdCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cccdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cccdTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
    flex: 1,
  },
  cccdNote: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  cccdInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cccdLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  cccdValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#f0f7ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fba31d",
  },
  roleText: {
    fontSize: 14,
    color: "#fba31d",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#fba31d",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  editFullButton: {
    backgroundColor: "#fba31d",
    flexDirection: "row",
    gap: 8,
  },
  editFullButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
