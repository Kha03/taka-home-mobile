import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type {
  Property,
  RoomTypeDetail,
  LandlordAndTenant,
} from "@/lib/api/types";
import MapLocation from "./MapLocation";
import PropertyDetailItem from "./PropertyDetailItem";

const { width: screenWidth } = Dimensions.get("window");

interface PropertyDetailViewProps {
  property: Property | RoomTypeDetail;
  type: string;
  user: any;
  isAuthenticated: boolean;
  onStartChat: (propertyId: string, landlordId: string) => Promise<void>;
  onCreateBooking: (
    propertyId: string,
    roomId: string | undefined,
    landlordId: string
  ) => Promise<void>;
  onFetchLandlordStats: (landlordId: string) => Promise<any>;
}

// Type guard function
const isRoomTypeDetail = (
  prop: Property | RoomTypeDetail
): prop is RoomTypeDetail => {
  return "rooms" in prop && Array.isArray(prop.rooms) && prop.rooms.length > 0;
};

export default function PropertyDetailView({
  property,
  type,
  user,
  isAuthenticated,
  onStartChat,
  onCreateBooking,
  onFetchLandlordStats,
}: PropertyDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [landlordStats, setLandlordStats] = useState({
    totalProperties: 0,
    totalBooking: 0,
    yearsOfParticipation: "0",
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Data extraction logic
  const getImages = (): string[] => {
    if (isRoomTypeDetail(property)) {
      const imgs: string[] = [];
      if (property.heroImage) imgs.push(property.heroImage);
      if (property.images) imgs.push(...property.images);
      return imgs.length > 0
        ? imgs
        : ["https://via.placeholder.com/400x240?text=Property+Image"];
    } else {
      const imgs: string[] = [];
      if (property.heroImage) imgs.push(property.heroImage);
      if (property.images) imgs.push(...property.images);
      return imgs.length > 0
        ? imgs
        : ["https://via.placeholder.com/400x240?text=Property+Image"];
    }
  };

  const getTitle = (): string => {
    if (isRoomTypeDetail(property)) {
      return property.rooms[0]?.property?.title || "Chi tiết phòng trọ";
    }
    return property.title || "Chi tiết bất động sản";
  };

  const getLandlord = (): LandlordAndTenant | undefined => {
    if (isRoomTypeDetail(property)) {
      return property.rooms[0]?.property?.landlord;
    }
    return (property as Property).landlord;
  };

  const getUnits = (): string[] => {
    if (isRoomTypeDetail(property)) {
      return property.rooms
        .filter((room) => !room.isVisible)
        .map((room) => room.name);
    }
    const apartmentProperty = property as Property;
    return apartmentProperty.unit ? [apartmentProperty.unit] : [];
  };

  const getPropertyId = (): string => {
    if (isRoomTypeDetail(property)) {
      return property.rooms[0]?.property?.id || "";
    }
    return property.id || "";
  };

  const getMapLocation = (): string | undefined => {
    if (isRoomTypeDetail(property)) {
      return property.rooms[0]?.property?.mapLocation;
    }
    return (property as Property).mapLocation;
  };

  const getData = () => {
    if (isRoomTypeDetail(property)) {
      const propertyInfo = property.rooms[0]?.property;
      return {
        title: propertyInfo?.title || "Phòng trọ",
        price: Number(property.price) || 0,
        location: `${propertyInfo?.address}, ${propertyInfo?.ward}, ${propertyInfo?.province}`,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: Number(property.area) || 0,
        furnishing: property.furnishing || "Không có thông tin",
        category: "Phòng trọ",
        roomTypeName: property.name,
        roomCount: property.rooms?.filter((r) => !r.isVisible).length || 0,
        electricityPrice: Number(propertyInfo?.electricityPricePerKwh) || 0,
        waterPrice: Number(propertyInfo?.waterPricePerM3) || 0,
        updatedAt: property.updatedAt,
      };
    } else {
      return {
        title: property.title || "Bất động sản",
        price: property.price || 0,
        location: `${property.address}, ${property.ward}, ${property.province}`,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || 0,
        furnishing: property.furnishing || "Không có thông tin",
        category: "Chung cư / Nhà ở",
        unit: property.unit || "",
        updatedAt: property.updatedAt,
      };
    }
  };

  const images = getImages();
  const title = getTitle();
  const landlord = getLandlord();
  const units = getUnits();
  const propertyId = getPropertyId();
  const data = getData();
  const propertyType = type;
  const isRented = isRoomTypeDetail(property)
    ? property.rooms.every((room) => room.isVisible)
    : (property as Property).isVisible;

  // Fetch landlord statistics
  useEffect(() => {
    const fetchLandlordStats = async () => {
      if (!landlord?.id) return;

      try {
        setIsLoadingStats(true);
        const stats = await onFetchLandlordStats(landlord.id);
        if (stats) {
          setLandlordStats({
            totalProperties: stats.totalProperties,
            totalBooking: stats.totalBooking,
            yearsOfParticipation: stats.yearsOfParticipation,
          });
        }
      } catch (error) {
        console.error("Error fetching landlord statistics:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchLandlordStats();
  }, [landlord?.id]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Không rõ";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Vừa mới cập nhật";
    if (diffHours < 24) return `Cập nhật ${diffHours} giờ trước`;
    if (diffDays < 7) return `Cập nhật ${diffDays} ngày trước`;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `Cập nhật ${day}/${month}/${year}`;
  };

  const handleStartChat = async () => {
    if (!landlord?.id) return;

    setIsCreatingChat(true);
    try {
      await onStartChat(propertyId, landlord.id);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!landlord?.id) return;

    if (propertyType === "boarding" && !selectedUnit) {
      Alert.alert(
        "Thông báo",
        "Bạn cần chọn phòng trước khi gửi yêu cầu thuê."
      );
      return;
    }

    setIsCreatingBooking(true);
    try {
      let roomId: string | undefined;

      if (propertyType === "boarding" && selectedUnit) {
        if (isRoomTypeDetail(property)) {
          const selectedRoom = property.rooms.find(
            (room) => room.name === selectedUnit
          );
          roomId = selectedRoom?.id;
        }
      }

      await onCreateBooking(propertyId, roomId, landlord.id);
      setSelectedUnit("");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1 >= images.length ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev - 1 < 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Heart button */}
          <Pressable
            style={styles.heartButton}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#ef4444" : "#ffffff"}
            />
          </Pressable>

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <Pressable style={styles.navButtonLeft} onPress={prevImage}>
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Pressable style={styles.navButtonRight} onPress={nextImage}>
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>

              {/* Image indicators */}
              <View style={styles.indicators}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroll}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {images.map((image, index) => (
              <Pressable
                key={index}
                onPress={() => setCurrentImageIndex(index)}
                style={[
                  styles.thumbnail,
                  index === currentImageIndex && styles.activeThumbnail,
                ]}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Property Main Content */}
      <View style={styles.contentSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{formatPrice(data.price)} VND/Tháng</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.locationText}>{data.location}</Text>
        </View>
        <Text style={styles.updateTime}>{getTimeAgo(data.updatedAt)}</Text>

        {/* Property Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <PropertyDetailItem
              icon="business"
              label="Danh mục"
              value={data.category}
            />
            <PropertyDetailItem
              icon="resize"
              label="Diện tích"
              value={`${data.area} m²`}
            />
            <PropertyDetailItem
              icon="home"
              label={isRoomTypeDetail(property) ? "Số phòng trống" : "Mã căn"}
              value={
                isRoomTypeDetail(property)
                  ? `${data.roomCount} phòng`
                  : data.unit || "N/A"
              }
            />
          </View>
          <View style={styles.detailRow}>
            <PropertyDetailItem
              icon="bed"
              label="Số phòng ngủ"
              value={`${data.bedrooms} phòng`}
            />
            <PropertyDetailItem
              icon="water"
              label="Số phòng vệ sinh"
              value={`${data.bathrooms} phòng`}
            />
            <PropertyDetailItem
              icon="checkmark-circle"
              label="Tình trạng nội thất"
              value={data.furnishing}
            />
          </View>
        </View>
      </View>

      {/* Property Description */}
      {property.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <Text style={styles.descriptionText}>{property.description}</Text>
        </View>
      )}

      {/* Map Location */}
      {getMapLocation() && <MapLocation mapLocation={getMapLocation()!} />}

      {/* Landlord Section */}
      {landlord && (
        <View style={styles.landlordSection}>
          <Text style={styles.sectionTitle}>Thông tin chủ nhà</Text>
          <View style={styles.landlordCard}>
            <View style={styles.landlordInfo}>
              <View style={styles.avatar}>
                {landlord.avatarUrl ? (
                  <Image
                    source={{ uri: landlord.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {landlord.fullName?.charAt(0) || "?"}
                  </Text>
                )}
              </View>
              <View style={styles.landlordDetails}>
                <Text style={styles.landlordName}>{landlord.fullName}</Text>
                <View style={styles.landlordPhone}>
                  <Ionicons name="call" size={14} color="#6b7280" />
                  <Text style={styles.phoneText}>{landlord.phone}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>
                    {landlord.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Landlord Statistics */}
            {!isLoadingStats && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {landlordStats.totalProperties}
                  </Text>
                  <Text style={styles.statLabel}>BĐS</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {landlordStats.totalBooking}
                  </Text>
                  <Text style={styles.statLabel}>HĐ</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {landlordStats.yearsOfParticipation}
                  </Text>
                  <Text style={styles.statLabel}>Năm</Text>
                </View>
              </View>
            )}

            {/* Chat Button */}
            <Pressable
              style={styles.chatButton}
              onPress={handleStartChat}
              disabled={isCreatingChat}
            >
              <Ionicons name="chatbubble" size={20} color="#ffffff" />
              <Text style={styles.chatButtonText}>
                {isCreatingChat ? "Đang tạo..." : "Chat ngay"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Booking Section */}
      <View style={styles.bookingSection}>
        <Text style={styles.sectionTitle}>Gửi yêu cầu thuê bất động sản?</Text>

        {/* Unit/Room Selection */}
        {propertyType === "boarding" ? (
          <View style={styles.roomSelection}>
            <Text style={styles.roomSelectionLabel}>Chọn phòng:</Text>
            <View style={styles.roomGrid}>
              {units.map((unit) => (
                <Pressable
                  key={unit}
                  style={[
                    styles.roomButton,
                    selectedUnit === unit && styles.selectedRoomButton,
                  ]}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <Text
                    style={[
                      styles.roomButtonText,
                      selectedUnit === unit && styles.selectedRoomButtonText,
                    ]}
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          // APARTMENT: Display unit info
          <View style={styles.unitInfo}>
            <Text style={styles.unitInfoLabel}>Thông tin căn hộ:</Text>
            {(property as Property).block && (
              <Text style={styles.unitInfoText}>
                Tòa nhà: {(property as Property).block}
              </Text>
            )}
            {(property as Property).floor && (
              <Text style={styles.unitInfoText}>
                Tầng: {(property as Property).floor}
              </Text>
            )}
            {(property as Property).unit && (
              <Text style={styles.unitInfoText}>
                Căn hộ: {(property as Property).unit}
              </Text>
            )}
          </View>
        )}

        {/* Booking Button */}
        <Pressable
          style={[styles.bookingButton, isRented && styles.disabledButton]}
          onPress={handleCreateBooking}
          disabled={isCreatingBooking || isRented}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
          <Text style={styles.bookingButtonText}>
            {isCreatingBooking ? "Đang gửi..." : "Yêu cầu thuê"}
          </Text>
        </Pressable>

        {/* Rental Status Warning */}
        {isRented && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Đang cho thuê, hãy quay lại sau
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageSection: {
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    height: 240,
    backgroundColor: "#f3f4f6",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonLeft: {
    position: "absolute",
    left: 16,
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonRight: {
    position: "absolute",
    right: 16,
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  indicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "#ffffff",
  },
  thumbnailScroll: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    gap: 8,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  activeThumbnail: {
    borderColor: "#3b82f6",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  contentSection: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 4,
    color: "#6b7280",
    fontSize: 14,
  },
  updateTime: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 16,
  },
  detailsGrid: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
  },
  descriptionSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
  landlordSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  landlordCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  landlordInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  landlordDetails: {
    flex: 1,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  landlordPhone: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  phoneText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  verifiedBadge: {
    alignSelf: "flex-start",
  },
  verifiedText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  chatButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  bookingSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  roomSelection: {
    marginBottom: 16,
  },
  roomSelectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roomButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  selectedRoomButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  roomButtonText: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "500",
  },
  selectedRoomButtonText: {
    color: "#ffffff",
  },
  unitInfo: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  unitInfoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  unitInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  bookingButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  bookingButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#92400e",
    fontWeight: "500",
    textAlign: "center",
  },
});
