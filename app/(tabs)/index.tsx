import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { propertyService } from "@/lib/api";
import type { FilterPropertyQuery } from "@/lib/api/types";
import { PropertyTypeEnum } from "@/lib/api/types";
import type { PropertyOrRoomType } from "@/lib/utils/property-helpers";
import {
  getDisplayId,
  getPropertyType,
  getPropertyTitle,
  getPropertyLocation,
  getPropertyImage,
  getPropertyDetails,
} from "@/lib/utils/property-helpers";

export default function PropertiesScreen() {
  const [properties, setProperties] = useState<PropertyOrRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageLimit = 10;

  // Filter states
  const [filters, setFilters] = useState<FilterPropertyQuery>({
    type: undefined,
    fromPrice: undefined,
    toPrice: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    fromArea: undefined,
    toArea: undefined,
    furnishing: undefined,
    province: undefined,
  });

  const [appliedFilters, setAppliedFilters] =
    useState<FilterPropertyQuery>(filters);

  useEffect(() => {
    // Reset pagination when filters or search change
    setCurrentPage(1);
    setHasMore(true);
    loadProperties(1, true);
  }, [appliedFilters, searchQuery]);

  const loadProperties = async (page: number = 1, reset: boolean = false) => {
    // Prevent loading if already loading or no more data
    if ((loadingMore || !hasMore) && !reset && page > 1) return;

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await propertyService.getProperties({
        ...appliedFilters,
        q: searchQuery || undefined, // Add search query
        isApproved: true, // Only show approved properties
        page,
        limit: pageLimit,
      });

      if (response.code === 200 && response.data) {
        // API returns nested structure: { data: { data: [...], pagination: {...} } }
        const responseData = response.data as any;

        if (responseData.data && Array.isArray(responseData.data)) {
          const newProperties = responseData.data as PropertyOrRoomType[];

          if (reset || page === 1) {
            setProperties(newProperties);
          } else {
            setProperties((prev) => [...prev, ...newProperties]);
          }

          // Update pagination info (API returns "pagination" not "meta")
          if (responseData.pagination) {
            const { currentPage, totalPages, hasNextPage, totalItems } =
              responseData.pagination;

            setCurrentPage(currentPage);
            setTotalPages(totalPages);
            setHasMore(hasNextPage);

            console.log(
              `✅ Loaded page ${currentPage}/${totalPages} - ${newProperties.length} items (Total: ${totalItems})`
            );
          } else {
            // No more pages
            setHasMore(false);
          }
        } else if (Array.isArray(response.data)) {
          // Fallback if API returns array directly
          const data = response.data as PropertyOrRoomType[];
          if (reset || page === 1) {
            setProperties(data);
          } else {
            setProperties((prev) => [...prev, ...data]);
          }
          setHasMore(false); // No pagination info
        }
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    loadProperties(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && currentPage < totalPages) {
      const nextPage = currentPage + 1;
      loadProperties(nextPage, false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
    setHasMore(true);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
    setHasMore(true);
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilters(false);
    // Reset pagination when applying filters
    setCurrentPage(1);
    setHasMore(true);
  };

  const clearFilters = () => {
    const emptyFilters: FilterPropertyQuery = {
      type: undefined,
      fromPrice: undefined,
      toPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      fromArea: undefined,
      toArea: undefined,
      furnishing: undefined,
      province: undefined,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilters(false);
    // Reset pagination when clearing filters
    setCurrentPage(1);
    setHasMore(true);
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu/tháng`;
    }
    return `${price.toLocaleString("vi-VN")} đ/tháng`;
  };

  const renderPropertyCard = ({ item }: { item: PropertyOrRoomType }) => {
    // Use helper functions to extract data from PropertyOrRoomType
    const propertyType = getPropertyType(item);
    const title = getPropertyTitle(item);
    const location = getPropertyLocation(item);
    const image = getPropertyImage(item);
    const details = getPropertyDetails(item);
    const displayId = getDisplayId(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          const url =
            propertyType === "boarding"
              ? `/properties/${displayId}?type=BOARDING`
              : `/properties/${displayId}`;
          router.push(url);
        }}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: image || "https://via.placeholder.com/400x300",
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Property Type Badge */}
        <View
          style={[
            styles.typeBadge,
            propertyType === "boarding"
              ? styles.boardingBadge
              : styles.apartmentBadge,
          ]}
        >
          <Text style={styles.typeBadgeText}>
            {propertyType === "boarding" ? "Nhà trọ" : "Chung cư"}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.cardInfo}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.cardLocation} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <View style={styles.cardDetails}>
            {details.bedrooms > 0 && (
              <View style={styles.detailItem}>
                <MaterialIcons name="bed" size={16} color="#666" />
                <Text style={styles.detailText}>{details.bedrooms} PN</Text>
              </View>
            )}
            {details.bathrooms > 0 && (
              <View style={styles.detailItem}>
                <MaterialIcons name="bathtub" size={16} color="#666" />
                <Text style={styles.detailText}>{details.bathrooms} WC</Text>
              </View>
            )}
            {details.area > 0 && (
              <View style={styles.detailItem}>
                <MaterialIcons name="square-foot" size={16} color="#666" />
                <Text style={styles.detailText}>{details.area} m²</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardPrice}>{formatPrice(details.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterSection = () => (
    <View style={styles.filterContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.filterTitle}>Bộ lọc tìm kiếm</Text>

        {/* Property Type */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Loại hình</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                !filters.type && styles.filterOptionActive,
              ]}
              onPress={() => setFilters({ ...filters, type: undefined })}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  !filters.type && styles.filterOptionTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.type === PropertyTypeEnum.BOARDING &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, type: PropertyTypeEnum.BOARDING })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.type === "BOARDING" && styles.filterOptionTextActive,
                ]}
              >
                Nhà trọ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.type === PropertyTypeEnum.APARTMENT &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, type: PropertyTypeEnum.APARTMENT })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.type === "APARTMENT" && styles.filterOptionTextActive,
                ]}
              >
                Chung cư
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Mức giá (triệu/tháng)</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                !filters.fromPrice &&
                  !filters.toPrice &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  fromPrice: undefined,
                  toPrice: undefined,
                })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  !filters.fromPrice &&
                    !filters.toPrice &&
                    styles.filterOptionTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.toPrice === 2000000 && styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  fromPrice: undefined,
                  toPrice: 2000000,
                })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.toPrice === 2000000 && styles.filterOptionTextActive,
                ]}
              >
                &lt; 2tr
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.fromPrice === 2000000 &&
                  filters.toPrice === 5000000 &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, fromPrice: 2000000, toPrice: 5000000 })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.fromPrice === 2000000 &&
                    filters.toPrice === 5000000 &&
                    styles.filterOptionTextActive,
                ]}
              >
                2-5tr
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.fromPrice === 5000000 &&
                  filters.toPrice === 10000000 &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  fromPrice: 5000000,
                  toPrice: 10000000,
                })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.fromPrice === 5000000 &&
                    filters.toPrice === 10000000 &&
                    styles.filterOptionTextActive,
                ]}
              >
                5-10tr
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.fromPrice === 10000000 && styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  fromPrice: 10000000,
                  toPrice: undefined,
                })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.fromPrice === 10000000 &&
                    styles.filterOptionTextActive,
                ]}
              >
                &gt; 10tr
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bedrooms */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Số phòng ngủ</Text>
          <View style={styles.filterOptions}>
            {[undefined, 1, 2, 3, 4].map((num) => (
              <TouchableOpacity
                key={`bed-${num}`}
                style={[
                  styles.filterOption,
                  filters.bedrooms === num && styles.filterOptionActive,
                ]}
                onPress={() => setFilters({ ...filters, bedrooms: num })}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.bedrooms === num && styles.filterOptionTextActive,
                  ]}
                >
                  {num === undefined ? "Tất cả" : `${num}+`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bathrooms */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Số phòng tắm</Text>
          <View style={styles.filterOptions}>
            {[undefined, 1, 2, 3].map((num) => (
              <TouchableOpacity
                key={`bath-${num}`}
                style={[
                  styles.filterOption,
                  filters.bathrooms === num && styles.filterOptionActive,
                ]}
                onPress={() => setFilters({ ...filters, bathrooms: num })}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.bathrooms === num && styles.filterOptionTextActive,
                  ]}
                >
                  {num === undefined ? "Tất cả" : `${num}+`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Area */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Diện tích (m²)</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                !filters.fromArea &&
                  !filters.toArea &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({
                  ...filters,
                  fromArea: undefined,
                  toArea: undefined,
                })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  !filters.fromArea &&
                    !filters.toArea &&
                    styles.filterOptionTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.toArea === 30 && styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, fromArea: undefined, toArea: 30 })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.toArea === 30 && styles.filterOptionTextActive,
                ]}
              >
                &lt; 30m²
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.fromArea === 30 &&
                  filters.toArea === 50 &&
                  styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, fromArea: 30, toArea: 50 })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.fromArea === 30 &&
                    filters.toArea === 50 &&
                    styles.filterOptionTextActive,
                ]}
              >
                30-50m²
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.fromArea === 50 && styles.filterOptionActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, fromArea: 50, toArea: undefined })
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filters.fromArea === 50 && styles.filterOptionTextActive,
                ]}
              >
                &gt; 50m²
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Furnishing */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Nội thất</Text>
          <View style={styles.filterOptions}>
            {[undefined, "Đầy đủ", "Cơ bản", "Trống"].map((furnish) => (
              <TouchableOpacity
                key={`furnish-${furnish}`}
                style={[
                  styles.filterOption,
                  filters.furnishing === furnish && styles.filterOptionActive,
                ]}
                onPress={() => setFilters({ ...filters, furnishing: furnish })}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.furnishing === furnish &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  {furnish === undefined ? "Tất cả" : furnish}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm nhà trọ</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons
            name={showFilters ? "close" : "filter-list"}
            size={24}
            color="#2196F3"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <MaterialIcons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo tên, địa chỉ..."
              placeholderTextColor="#999"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.searchClearButton}
              >
                <MaterialIcons name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* Active Search/Filter Indicator */}
        {(searchQuery ||
          Object.values(appliedFilters).some((v) => v !== undefined)) && (
          <View style={styles.activeFiltersBar}>
            {searchQuery && (
              <View style={styles.activeFilterChip}>
                <MaterialIcons name="search" size={14} color="#007AFF" />
                <Text style={styles.activeFilterText} numberOfLines={1}>
                  {searchQuery}
                </Text>
                <TouchableOpacity onPress={clearSearch}>
                  <MaterialIcons name="close" size={14} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            {Object.values(appliedFilters).some((v) => v !== undefined) && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  clearFilters();
                  clearSearch();
                }}
              >
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filter Panel */}
        {showFilters && renderFilterSection()}

        {/* Properties List */}
        <FlatList
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={(item, index) => `${getDisplayId(item)}-${index}`}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            properties.length > 0 && hasMore && !loading ? (
              <View style={styles.loadMoreContainer}>
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <ActivityIndicator size="small" color="#007AFF" />
                      <Text style={styles.loadMoreButtonText}>Đang tải...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.loadMoreButtonText}>Xem thêm</Text>
                      <Text style={styles.loadMoreHint}>
                        (Trang {currentPage}/{totalPages})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : properties.length > 0 && !hasMore ? (
              <View style={styles.loadMoreContainer}>
                <Text style={styles.endOfListText}>
                  Đã hiển thị tất cả {properties.length} bất động sản
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="home" size={80} color="#ccc" />
                <Text style={styles.emptyText}>
                  Không tìm thấy bất động sản nào
                </Text>
                <Text style={styles.emptySubtext}>
                  Thử thay đổi bộ lọc để xem thêm
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    padding: 0,
  },
  searchClearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  activeFiltersBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f0f7ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 8,
    flexWrap: "wrap",
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#007AFF",
    maxWidth: 200,
  },
  activeFilterText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
    flex: 1,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ff3b30",
    marginLeft: "auto",
  },
  clearAllText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    maxHeight: "60%",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterOptionActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666",
  },
  filterOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196F3",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: "48%",
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  boardingBadge: {
    backgroundColor: "#4CAF50",
  },
  apartmentBadge: {
    backgroundColor: "#FF9800",
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
    height: 36,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  cardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#666",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2196F3",
  },
  priceNote: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  loadMoreButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 160,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadMoreButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  loadMoreHint: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginLeft: 4,
  },
  endOfListText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});
