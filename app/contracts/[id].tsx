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
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { bookingService } from "@/lib/api";
import { invoiceService } from "@/lib/api";
import { contractService } from "@/lib/api";
import { bookingToContract } from "@/lib/contracts/mappers";
import type { ContractVM, ContractStatus } from "@/types/contracts";
import { useAuth } from "@/contexts/auth-context";
import { InvoicePaymentModal } from "@/components/contracts";

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [contract, setContract] = useState<ContractVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");

  const userRole = user?.roles || "TENANT";
  const [copyLoading, setCopyLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyContractCode = async () => {
    if (!contract) {
      return;
    }

    const code = contract.contractCode || contract.contractId || contract.id;
    try {
      setCopyLoading(true);
      const clipboard = await import("expo-clipboard");
      await clipboard.setStringAsync(code);
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      Alert.alert("Lỗi", "Không thể sao chép mã hợp đồng");
    } finally {
      setCopyLoading(false);
    }
  };

  /**
   * CopyContractButton
   * - Place <CopyContractButton /> next to the displayed contract code in the UI (e.g. inside the contractHeader).
   */
  const CopyContractButton = () => (
    <TouchableOpacity
      style={[styles.copyButton, copied && styles.copiedButton]}
      onPress={handleCopyContractCode}
      disabled={copyLoading || copied}
      activeOpacity={0.7}
    >
      {copyLoading ? (
        <ActivityIndicator size="small" color="#071658" />
      ) : (
        <>
          <MaterialIcons
            name={copied ? "check" : "content-copy"}
            size={16}
            color={copied ? "#4CAF50" : "#071658"}
          />
          <Text
            style={[styles.copyButtonText, copied && styles.copiedButtonText]}
          >
            {copied ? "Đã sao chép" : "Sao chép"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
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

  const handleInvoicePress = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    // Reload contract detail to refresh invoice status
    loadContractDetail();
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
          color: "#071658",
          icon: "account-balance-wallet" as const,
        };
      case "awaiting_landlord_deposit":
        return {
          label: userRole[0] === "LANDLORD" ? "Chờ đặt cọc" : "Chờ chủ nhà",
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
            <MaterialIcons name="description" size={20} color="#071658" />
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
          <TouchableOpacity
            key={invoice.id}
            style={styles.invoiceCard}
            onPress={() => handleInvoicePress(invoice.invoiceId)}
            activeOpacity={0.7}
          >
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
            <View style={styles.invoiceActions}>
              <View style={styles.invoiceActionText}>
                <MaterialIcons name="touch-app" size={16} color="#071658" />
                <Text style={styles.tapToViewText}>
                  {invoice.status === "PAID"
                    ? "Nhấp để xem chi tiết"
                    : "Nhấp để thanh toán"}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#071658" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#071658" />
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {/* Contract Header */}
        <View style={styles.contractHeader}>
          <View style={styles.contractCodeRow}>
            <Text style={styles.contractCode}>
              {contract.contractCode || contract.contractId || contract.id}
            </Text>
            <CopyContractButton />
          </View>
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
                color="#071658"
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

      {/* Invoice Payment Modal */}
      <InvoicePaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        invoiceId={selectedInvoiceId}
        onPaymentSuccess={handlePaymentSuccess}
      />
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
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
    flex: 1,
  },
  contractCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#071658",
    gap: 4,
  },
  copiedButton: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
  },
  copyButtonText: {
    fontSize: 12,
    color: "#071658",
    fontWeight: "600",
  },
  copiedButtonText: {
    color: "#4CAF50",
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
    color: "#071658",
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
    backgroundColor: "#071658",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#071658",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#071658",
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
    marginBottom: 8,
  },
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  invoiceActionText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tapToViewText: {
    fontSize: 13,
    color: "#071658",
    fontWeight: "500",
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
