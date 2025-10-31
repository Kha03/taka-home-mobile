import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { propertyService } from "@/lib/api/services/property";
import { statisticsService } from "@/lib/api/services/statistics";
import { chatService } from "@/lib/api/services/chat";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import type { Property, RoomTypeDetail } from "@/lib/api/types";
import PropertyDetailView from "../../components/properties/PropertyDetailView";

export default function PropertyDetailPage() {
  const { id, type } = useLocalSearchParams<{
    id: string;
    type?: string;
  }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState<Property | RoomTypeDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID bất động sản không hợp lệ");
      setLoading(false);
      return;
    }

    fetchPropertyDetail();
  }, [id, type]);

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const propertyType = (type || "apartment").toUpperCase();
      const isBoarding = propertyType === "BOARDING";

      // Call appropriate API based on property type
      const response = isBoarding
        ? await propertyService.getRoomTypeById(id)
        : await propertyService.getPropertyById(id);

      if (response.code === 200 && response.data) {
        setProperty(response.data);
      } else {
        setError("Không thể tải thông tin bất động sản");
      }
    } catch (err) {
      console.error("Failed to fetch property detail:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const handleStartChat = async (propertyId: string, landlordId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để chat với chủ nhà.");
      router.push("/signin");
      return;
    }

    if (user.id === landlordId) {
      toast.error("Bạn không thể chat với chính mình.");
      return;
    }

    try {
      const response = await chatService.startChatForProperty(propertyId);

      if ((response.code === 201 || response.code === 200) && response.data) {
        toast.success("Đã tạo phòng chat. Đang chuyển hướng...");
        router.push(`/chat/${response.data.id}`);
      } else {
        toast.error(response.message || "Không thể tạo phòng chat.");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Có lỗi xảy ra khi tạo phòng chat. Vui lòng thử lại.");
    }
  };

  const handleFetchLandlordStats = async (landlordId: string) => {
    try {
      const response = await statisticsService.getLandlordStatistics(
        landlordId
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching landlord statistics:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            title: "Đang tải...",
            headerShown: true,
          }}
        />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen
          options={{
            title: "Lỗi",
            headerShown: true,
          }}
        />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchPropertyDetail} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            title: "Không tìm thấy",
            headerShown: true,
          }}
        />
        <Text style={styles.notFoundText}>
          Không tìm thấy thông tin bất động sản
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chi tiết bất động sản",
          headerShown: true,
        }}
      />
      <PropertyDetailView
        property={property}
        type={type || "apartment"}
        user={user}
        isAuthenticated={isAuthenticated}
        onStartChat={handleStartChat}
        onFetchLandlordStats={handleFetchLandlordStats}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  notFoundText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
