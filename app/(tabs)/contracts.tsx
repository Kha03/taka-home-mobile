import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContracts } from "@/hooks/use-contracts";
import type { ContractVM, ContractStatus } from "@/types/contracts";

type TabType = "all" | "pending" | "active" | "expired";

export default function ContractsScreen() {
  const router = useRouter();
  const { contracts, loading, error, refresh, userRole } = useContracts();
  const [selectedTab, setSelectedTab] = useState<TabType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Filter contracts by tab
  const filteredContracts = useMemo(() => {
    if (selectedTab === "all") return contracts;
    if (selectedTab === "pending") {
      return contracts.filter(
        (c) =>
          c.status === "pending_signature" ||
          c.status === "pending_landlord" ||
          c.status === "awaiting_deposit" ||
          c.status === "awaiting_landlord_deposit" ||
          c.status === "ready_for_handover"
      );
    }
    return contracts.filter((c) => c.status === selectedTab);
  }, [contracts, selectedTab]);

  // Count contracts by tab
  const counts = useMemo(() => {
    const all = contracts.length;
    const pending = contracts.filter(
      (c) =>
        c.status === "pending_signature" ||
        c.status === "pending_landlord" ||
        c.status === "awaiting_deposit" ||
        c.status === "awaiting_landlord_deposit" ||
        c.status === "ready_for_handover"
    ).length;
    const active = contracts.filter((c) => c.status === "active").length;
    const expired = contracts.filter((c) => c.status === "expired").length;
    return { all, pending, active, expired };
  }, [contracts]);

  // Get status config
  const getStatusConfig = (status: ContractStatus) => {
    switch (status) {
      case "active":
        return {
          label: "Hoạt động",
          color: "#4CAF50",
          icon: "check-circle" as const,
        };
      case "expired":
        return {
          label: "Kết thúc",
          color: "#9E9E9E",
          icon: "history" as const,
        };
      case "pending_signature":
        return {
          label: "Chờ ký",
          color: "#FF9800",
          icon: "edit" as const,
        };
      case "pending_landlord":
        return {
          label: "Chờ chủ nhà",
          color: "#FF9800",
          icon: "hourglass-empty" as const,
        };
      case "awaiting_deposit":
        return {
          label: "Chờ đặt cọc",
          color: "#071658",
          icon: "account-balance-wallet" as const,
        };
      case "awaiting_landlord_deposit":
        return {
          label: "Chờ cọc chủ nhà",
          color: "#071658",
          icon: "schedule" as const,
        };
      case "ready_for_handover":
        return {
          label: "Sẵn sàng bàn giao",
          color: "#4CAF50",
          icon: "home" as const,
        };
      default:
        return {
          label: "Không xác định",
          color: "#9E9E9E",
          icon: "help" as const,
        };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Render contract card
  const renderContractCard = (contract: ContractVM) => {
    const statusConfig = getStatusConfig(contract.status);

    return (
      <TouchableOpacity
        key={contract.id}
        style={styles.contractCard}
        onPress={() => router.push(`/contracts/${contract.bookingId}`)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.color + "20" },
          ]}
        >
          <MaterialIcons
            name={statusConfig.icon}
            size={16}
            color={statusConfig.color}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Contract Info */}
        <View style={styles.contractInfo}>
          <Text style={styles.contractCode}>
            Mã HĐ: {contract.contractCode || contract.contractId || "N/A"}
          </Text>
          <Text style={styles.propertyName}>Phòng {contract.propertyCode}</Text>
          <Text style={styles.address} numberOfLines={2}>
            {contract.address}
          </Text>

          {/* Property Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="home" size={16} color="#666" />
              <Text style={styles.detailText}>{contract.propertyCode}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="category" size={16} color="#666" />
              <Text style={styles.detailText}>{contract.category}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="apartment" size={16} color="#666" />
              <Text style={styles.detailText}>{contract.propertyType}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá thuê:</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(contract.price)}/tháng
            </Text>
          </View>

          {/* Contract Period */}
          <View style={styles.periodContainer}>
            <MaterialIcons name="date-range" size={16} color="#666" />
            <Text style={styles.periodText}>
              {contract.startDate
                ? new Date(contract.startDate).toLocaleDateString("vi-VN")
                : "Chưa xác định"}{" "}
              -{" "}
              {contract.endDate
                ? new Date(contract.endDate).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </Text>
          </View>

          {/* Invoice Summary for Active Contracts */}
          {contract.status === "active" &&
            contract.invoices &&
            contract.invoices.length > 0 && (
              <View style={styles.invoiceSummary}>
                <View style={styles.invoiceHeader}>
                  <MaterialIcons name="receipt" size={16} color="#071658" />
                  <Text style={styles.invoiceHeaderText}>
                    Hóa đơn ({contract.invoices.length})
                  </Text>
                </View>
                <View style={styles.invoiceStats}>
                  <View style={styles.invoiceStat}>
                    <Text style={styles.invoiceStatLabel}>Chưa thanh toán</Text>
                    <Text
                      style={[styles.invoiceStatValue, { color: "#F44336" }]}
                    >
                      {
                        contract.invoices.filter(
                          (i) =>
                            i.status === "PENDING" || i.status === "OVERDUE"
                        ).length
                      }
                    </Text>
                  </View>
                  <View style={styles.invoiceStat}>
                    <Text style={styles.invoiceStatLabel}>Đã thanh toán</Text>
                    <Text
                      style={[styles.invoiceStatValue, { color: "#4CAF50" }]}
                    >
                      {
                        contract.invoices.filter((i) => i.status === "PAID")
                          .length
                      }
                    </Text>
                  </View>
                </View>
              </View>
            )}
        </View>

        {/* Arrow Icon */}
        <View style={styles.arrowContainer}>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    let message = "";
    let icon: keyof typeof MaterialIcons.glyphMap = "description";

    switch (selectedTab) {
      case "all":
        message = "Bạn chưa có hợp đồng nào";
        icon = "description";
        break;
      case "pending":
        message = "Không có hợp đồng chờ xử lý";
        icon = "hourglass-empty";
        break;
      case "active":
        message = "Không có hợp đồng đang hoạt động";
        icon = "check-circle";
        break;
      case "expired":
        message = "Không có hợp đồng đã kết thúc";
        icon = "history";
        break;
    }

    return (
      <View style={styles.emptyState}>
        <MaterialIcons name={icon} size={64} color="#BDBDBD" />
        <Text style={styles.emptyStateText}>{message}</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#071658" />
        <Text style={styles.loadingText}>Đang tải hợp đồng...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hợp Đồng</Text>
        <Text style={styles.headerSubtitle}>Quản lý hợp đồng thuê của bạn</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "all" && styles.activeTab]}
          onPress={() => setSelectedTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "all" && styles.activeTabText,
            ]}
          >
            Tất cả ({counts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "pending" && styles.activeTab]}
          onPress={() => setSelectedTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "pending" && styles.activeTabText,
            ]}
          >
            Chờ xử lý ({counts.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "active" && styles.activeTab]}
          onPress={() => setSelectedTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "active" && styles.activeTabText,
            ]}
          >
            Hoạt động ({counts.active})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "expired" && styles.activeTab]}
          onPress={() => setSelectedTab("expired")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "expired" && styles.activeTabText,
            ]}
          >
            Kết thúc ({counts.expired})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contract List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredContracts.length > 0
          ? filteredContracts.map(renderContractCard)
          : renderEmptyState()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#071658",
  },
  tabText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#071658",
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  contractCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  contractInfo: {
    flex: 1,
    paddingRight: 40,
  },
  contractCode: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: "30%",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  periodText: {
    fontSize: 12,
    color: "#666",
  },
  invoiceSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  invoiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  invoiceHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#212121",
  },
  invoiceStats: {
    flexDirection: "row",
    gap: 16,
  },
  invoiceStat: {
    flex: 1,
  },
  invoiceStatLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  invoiceStatValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#071658",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
