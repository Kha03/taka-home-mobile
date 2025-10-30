import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { bookingService } from "@/lib/api";
import { invoiceService } from "@/lib/api";
import { contractService } from "@/lib/api";
import { bookingToContract } from "@/lib/contracts/mappers";
import type { ContractVM, ContractStatus } from "@/types/contracts";
import { useAuth } from "@/contexts/auth-context";

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [contract, setContract] = useState<ContractVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const userRole = user?.roles || "TENANT";

  useEffect(() => {
    if (id) {
      loadContractDetail();
    }
  }, [id]);

  const loadContractDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get booking detail
      const response = await bookingService.getBookingById(id);
      if (response.code === 200 && response.data) {
        const contractVM = bookingToContract(response.data);

        // Get invoices if contract is active
        if (contractVM.status === "active" && contractVM.contractId) {
          try {
            const invoicesResponse =
              await invoiceService.getInvoiceByContractId(
                contractVM.contractId
              );
            if (invoicesResponse.code === 200 && invoicesResponse.data) {
              contractVM.invoices = invoicesResponse.data.map((inv, idx) => ({
                id: idx + 1,
                invoiceId: inv.id,
                month: new Date(inv.billingPeriod).toLocaleDateString("vi-VN", {
                  month: "2-digit",
                  year: "numeric",
                }),
                dueDate: new Date(inv.dueDate).toLocaleDateString("vi-VN"),
                status: inv.status as "PAID" | "PENDING" | "OVERDUE",
              }));
            }
          } catch (err) {
            console.error("Error loading invoices:", err);
          }
        }

        setContract(contractVM);
      } else {
        setError("Không tìm thấy hợp đồng");
      }
    } catch (err: any) {
      console.error("Error loading contract:", err);
      setError(err.message || "Không thể tải thông tin hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = async () => {
    if (!contract?.contractId) {
      Alert.alert("Thông báo", "Chưa có file hợp đồng");
      return;
    }

    try {
      setActionLoading(true);
      const response = await contractService.getFileUrl(contract.contractId);
      if (response.code === 200 && response.data?.fileUrl) {
        await Linking.openURL(response.data.fileUrl);
      } else {
        Alert.alert("Lỗi", "Không thể lấy link file hợp đồng");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể mở file hợp đồng");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (status: ContractStatus) => {
    switch (status) {
      case "active":
        return {
          label: "Đang hoạt động",
          color: "#4CAF50",
          icon: "check-circle" as const,
        };
      case "expired":
        return {
          label: "Đã kết thúc",
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
          label: userRole[0] === "LANDLORD" ? "Chờ ký" : "Chờ duyệt",
          color: "#FF9800",
          icon: "hourglass-empty" as const,
        };
      case "awaiting_deposit":
        return {
          label: "Chờ đặt cọc",
          color: "#2196F3",
          icon: "account-balance-wallet" as const,
        };
      case "awaiting_landlord_deposit":
        return {
          label: userRole[0] === "LANDLORD" ? "Chờ đặt cọc" : "Chờ chủ nhà",
          color: "#2196F3",
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

  const renderStatusInfo = () => {
    if (!contract) return null;

    const status = contract.status;

    // pending_landlord
    if (status === "pending_landlord") {
      if (userRole[0] === "LANDLORD") {
        return (
          <View style={styles.statusInfoContainer}>
            <Text style={styles.statusMessage}>
              🟠 Người thuê đã gửi yêu cầu thuê. Đang chờ xem xét và ký hợp
              đồng.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.statusInfoContainer}>
            <Text style={styles.statusMessage}>
              ⏳ Đang chờ chủ nhà duyệt yêu cầu thuê.
            </Text>
          </View>
        );
      }
    }

    // pending_signature
    if (status === "pending_signature") {
      return (
        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusMessage}>
            🟠 Đang chờ hai bên ký hợp đồng.
          </Text>
        </View>
      );
    }

    // awaiting_deposit
    if (status === "awaiting_deposit") {
      return (
        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusMessage}>
            🔵 Hai bên đang thực hiện đặt cọc để kích hoạt hợp đồng.
          </Text>
        </View>
      );
    }

    // awaiting_landlord_deposit
    if (status === "awaiting_landlord_deposit") {
      if (userRole[0] === "LANDLORD") {
        return (
          <View style={styles.statusInfoContainer}>
            <Text style={styles.statusMessage}>
              🟣 Người thuê đã đặt cọc. Đang chờ chủ nhà đặt cọc.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.statusInfoContainer}>
            <Text style={styles.statusMessage}>
              ✅ Bạn đã hoàn tất đặt cọc. Đang chờ chủ nhà đặt cọc.
            </Text>
          </View>
        );
      }
    }

    // ready_for_handover
    if (status === "ready_for_handover") {
      return (
        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusMessage}>
            🟢 Cả hai bên đã hoàn tất đặt cọc.{" "}
            {userRole[0] === "LANDLORD"
              ? "Chủ nhà đang xác nhận bàn giao."
              : "Đang chờ chủ nhà xác nhận bàn giao."}
          </Text>
        </View>
      );
    }

    // active
    if (status === "active") {
      return (
        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusMessage}>
            ✅ Hợp đồng đang hoạt động bình thường.
          </Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { width: "100%", marginTop: 12 },
            ]}
            onPress={handleViewContract}
            disabled={actionLoading}
          >
            <MaterialIcons name="description" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>Xem hợp đồng</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // expired
    if (status === "expired") {
      return (
        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusMessage}>
            ⛔ Hợp đồng đã kết thúc hoặc bị hủy.
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderInvoices = () => {
    if (
      contract?.status !== "active" ||
      !contract.invoices ||
      contract.invoices.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📄 Hóa đơn thanh toán ({contract.invoices.length})
        </Text>
        {contract.invoices.map((invoice) => (
          <View key={invoice.id} style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceTitle}>Hóa đơn {invoice.month}</Text>
              <View
                style={[
                  styles.invoiceStatusBadge,
                  {
                    backgroundColor:
                      invoice.status === "PAID"
                        ? "#E8F5E9"
                        : invoice.status === "OVERDUE"
                        ? "#FFEBEE"
                        : "#FFF3E0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.invoiceStatusText,
                    {
                      color:
                        invoice.status === "PAID"
                          ? "#4CAF50"
                          : invoice.status === "OVERDUE"
                          ? "#F44336"
                          : "#FF9800",
                    },
                  ]}
                >
                  {invoice.status === "PAID"
                    ? "✓ Đã thanh toán"
                    : invoice.status === "OVERDUE"
                    ? "⚠️ Quá hạn"
                    : "Chưa thanh toán"}
                </Text>
              </View>
            </View>
            <Text style={styles.invoiceDueDate}>
              Hạn thanh toán: {invoice.dueDate}
            </Text>
            {invoice.status !== "PAID" && userRole[0] === "TENANT" && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  { marginTop: 8 },
                ]}
                onPress={() => console.log("Pay invoice", invoice.invoiceId)}
              >
                <MaterialIcons name="payment" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải thông tin hợp đồng...</Text>
      </View>
    );
  }

  if (error || !contract) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>
          {error || "Không tìm thấy hợp đồng"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(contract.status);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
      </View>

      {/* Contract Header */}
      <View style={styles.contractHeader}>
        <Text style={styles.contractCode}>
          {contract.contractCode || contract.contractId || contract.id}
        </Text>
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
        <Text style={styles.contractType}>{contract.type}</Text>
        <View style={styles.partiesContainer}>
          <View style={styles.partyRow}>
            <MaterialIcons name="person" size={20} color="#666" />
            <Text style={styles.partyLabel}>Người thuê:</Text>
            <Text style={styles.partyValue}>{contract.tenant}</Text>
          </View>
          <View style={styles.partyRow}>
            <MaterialIcons name="business" size={20} color="#666" />
            <Text style={styles.partyLabel}>Chủ nhà:</Text>
            <Text style={styles.partyValue}>{contract.landlord}</Text>
          </View>
        </View>
      </View>

      {/* Contract Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="date-range" size={20} color="#666" />
            <Text style={styles.infoLabel}>Thời hạn:</Text>
          </View>
          <Text style={styles.infoValue}>
            {contract.startDate
              ? new Date(contract.startDate).toLocaleDateString("vi-VN")
              : "Chưa xác định"}{" "}
            -{" "}
            {contract.endDate
              ? new Date(contract.endDate).toLocaleDateString("vi-VN")
              : "Chưa xác định"}
          </Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
          </View>
          <Text style={styles.infoValue}>{contract.address}</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="home" size={20} color="#666" />
            <Text style={styles.infoLabel}>Mã phòng:</Text>
            <Text style={styles.infoValue}>{contract.propertyCode}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="category" size={20} color="#666" />
            <Text style={styles.infoLabel}>Loại:</Text>
            <Text style={styles.infoValue}>{contract.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
            <Text style={styles.infoLabel}>Giá thuê:</Text>
            <Text style={[styles.infoValue, styles.priceText]}>
              {formatCurrency(contract.price)}/tháng
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons
              name="account-balance-wallet"
              size={20}
              color="#2196F3"
            />
            <Text style={styles.infoLabel}>Tiền cọc:</Text>
            <Text style={[styles.infoValue, styles.depositText]}>
              {formatCurrency(contract.deposit)}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Info */}
      {renderStatusInfo()}

      {/* Invoices */}
      {renderInvoices()}

      <View style={{ height: 40 }} />
    </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  contractHeader: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  contractCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  contractType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  partiesContainer: {
    gap: 8,
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partyLabel: {
    fontSize: 14,
    color: "#666",
  },
  partyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 16,
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#212121",
    flex: 1,
  },
  priceText: {
    fontWeight: "bold",
    color: "#4CAF50",
    fontSize: 16,
  },
  depositText: {
    fontWeight: "bold",
    color: "#2196F3",
    fontSize: 16,
  },
  statusInfoContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
  invoiceCard: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  invoiceStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  invoiceStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  invoiceDueDate: {
    fontSize: 13,
    color: "#666",
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
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#2196F3",
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
