import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { contractService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type {
  BlockchainContractHistoryResponse,
  BlockchainPaymentHistoryResponse,
  PaymentStatus,
} from "@/types/contracts";

type OrgName = "OrgTenant" | "OrgLandlord";
type TabType = "contract" | "payment";

export default function ContractHistoryScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("contract");

  // Contract search states
  const [contractId, setContractId] = useState("");
  const [orgName, setOrgName] = useState<OrgName>("OrgTenant");
  const [contractHistory, setContractHistory] =
    useState<BlockchainContractHistoryResponse | null>(null);

  // Payment search states
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("SCHEDULED");
  const [paymentHistory, setPaymentHistory] =
    useState<BlockchainPaymentHistoryResponse | null>(null);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect organization based on user role
  useEffect(() => {
    if (user?.roles?.includes("LANDLORD")) {
      setOrgName("OrgLandlord");
    } else if (user?.roles?.includes("TENANT")) {
      setOrgName("OrgTenant");
    }
  }, [user]);

  const handleSearchContract = async () => {
    const trimmedId = contractId.trim();

    if (!trimmedId) {
      setError("Vui lòng nhập mã hợp đồng");
      return;
    }

    setLoading(true);
    setError(null);
    setContractHistory(null);

    try {
      const response = await contractService.getContractBlockchainHistory(
        trimmedId,
        orgName
      );

      if (response.code === 200 && response.data) {
        setContractHistory(response.data);

        if (response.data.data.length === 0) {
          setError("Không tìm thấy lịch sử cho hợp đồng này");
        }
      } else {
        setError(response.message || "Không thể tải lịch sử hợp đồng");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tra cứu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPayment = async () => {
    if (!contractId.trim()) {
      setError("Vui lòng tra cứu hợp đồng trước khi xem lịch thanh toán");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentHistory(null);

    try {
      const response = await contractService.getPaymentBlockchainHistory(
        orgName,
        paymentStatus
      );

      if (response.code === 200 && response.data) {
        // Filter payments by current contract ID
        const filteredData = response.data.data.filter(
          (payment) => payment.contractId === contractId.trim()
        );

        setPaymentHistory({
          data: filteredData,
        });

        if (filteredData.length === 0) {
          setError("Không tìm thấy lịch thanh toán");
        }
      } else {
        setError(response.message || "Không thể tải lịch thanh toán");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tra cứu"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING_SIGNATURE: { label: "Chờ ký", color: "#FFA500" },
      WAIT_DEPOSIT: { label: "Chờ cọc", color: "#FF6B6B" },
      WAIT_FIRST_PAYMENT: { label: "Chờ thanh toán", color: "#FF6B6B" },
      ACTIVE: { label: "Đang hoạt động", color: "#4CAF50" },
      EXPIRED: { label: "Hết hạn", color: "#999" },
      CANCELLED: { label: "Đã hủy", color: "#F44336" },
    };

    const config = statusMap[status] || { label: status, color: "#999" };

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Text style={styles.statusBadgeText}>{config.label}</Text>
      </View>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusMap: Record<
      PaymentStatus,
      { label: string; color: string; icon: string }
    > = {
      PAID: { label: "Đã thanh toán", color: "#4CAF50", icon: "check-circle" },
      SCHEDULED: { label: "Đã lên lịch", color: "#071658", icon: "schedule" },
      OVERDUE: { label: "Quá hạn", color: "#F44336", icon: "warning" },
    };

    const config = statusMap[status];

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <MaterialIcons name={config.icon as any} size={14} color="#fff" />
        <Text style={styles.statusBadgeText}>{config.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử Blockchain</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            Alert.alert(
              "Blockchain",
              "Tất cả giao dịch hợp đồng được ghi lại trên blockchain, đảm bảo tính minh bạch và bất biến"
            );
          }}
        >
          <MaterialIcons name="info-outline" size={24} color="#fba31d" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "contract" && styles.activeTab]}
          onPress={() => setActiveTab("contract")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "contract" && styles.activeTabText,
            ]}
          >
            Lịch sử Hợp đồng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "payment" && styles.activeTab]}
          onPress={() => setActiveTab("payment")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "payment" && styles.activeTabText,
            ]}
          >
            Lịch Thanh toán
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Contract Search Tab */}
        {activeTab === "contract" && (
          <>
            {/* Search Box */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nhập mã hợp đồng (VD: CT-20251025-XXX)"
                  placeholderTextColor="#999"
                  value={contractId}
                  onChangeText={setContractId}
                  onSubmitEditing={handleSearchContract}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  loading && styles.searchButtonDisabled,
                ]}
                onPress={handleSearchContract}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={20} color="#fff" />
                    <Text style={styles.searchButtonText}>Tra cứu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Organization Info Badge */}
            <View style={styles.orgInfoContainer}>
              <MaterialIcons name="business" size={18} color="#fba31d" />
              <Text style={styles.orgInfoText}>
                Đang tra cứu từ:{" "}
                <Text style={styles.orgInfoBold}>
                  {orgName === "OrgTenant" ? "Người thuê" : "Chủ nhà"}
                </Text>
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Contract History Results */}
            {contractHistory && contractHistory.data.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  Tìm thấy {contractHistory.data.length} giao dịch
                </Text>

                {contractHistory.data
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((item, index) => (
                    <View key={item.txId} style={styles.historyCard}>
                      {/* Card Header */}
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          <Text style={styles.cardHeaderNumber}>
                            #{contractHistory.data.length - index}
                          </Text>
                          {index === 0 && (
                            <View style={styles.latestBadge}>
                              <Text style={styles.latestBadgeText}>
                                Mới nhất
                              </Text>
                            </View>
                          )}
                        </View>
                        {getStatusBadge(item.value.status)}
                      </View>

                      {/* Timestamp & TxId */}
                      <Text style={styles.cardTimestamp}>
                        <MaterialIcons
                          name="access-time"
                          size={14}
                          color="#666"
                        />{" "}
                        {formatDate(item.timestamp)}
                      </Text>
                      <Text style={styles.cardTxId} numberOfLines={1}>
                        <MaterialIcons name="link" size={14} color="#666" /> TX:{" "}
                        {item.txId}
                      </Text>

                      {/* Contract Info */}
                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Mã hợp đồng:</Text>
                        <Text style={styles.infoValue}>
                          {item.value.contractId}
                        </Text>
                      </View>

                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Tiền thuê:</Text>
                        <Text style={[styles.infoValue, styles.priceHighlight]}>
                          {formatCurrency(item.value.rentAmount)}
                        </Text>
                      </View>

                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Tiền cọc:</Text>
                        <Text style={styles.infoValue}>
                          {formatCurrency(item.value.depositAmount)}
                        </Text>
                      </View>

                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Thời hạn:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(item.value.startDate).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          -{" "}
                          {new Date(item.value.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Text>
                      </View>

                      {/* Signatures */}
                      {item.value.signatures && (
                        <View style={styles.signaturesSection}>
                          <Text style={styles.sectionTitle}>
                            Chữ ký điện tử
                          </Text>

                          {/* Landlord Signature */}
                          <View style={styles.signatureItem}>
                            <MaterialIcons
                              name={
                                item.value.signatures.landlord.status ===
                                "SIGNED"
                                  ? "check-circle"
                                  : "schedule"
                              }
                              size={20}
                              color={
                                item.value.signatures.landlord.status ===
                                "SIGNED"
                                  ? "#4CAF50"
                                  : "#FFA500"
                              }
                            />
                            <Text style={styles.signatureText}>
                              Chủ nhà:{" "}
                              {item.value.signatures.landlord.status ===
                              "SIGNED"
                                ? "Đã ký"
                                : "Chưa ký"}
                            </Text>
                          </View>

                          {/* Tenant Signature */}
                          {item.value.signatures.tenant && (
                            <View style={styles.signatureItem}>
                              <MaterialIcons
                                name={
                                  item.value.signatures.tenant.status ===
                                  "SIGNED"
                                    ? "check-circle"
                                    : "schedule"
                                }
                                size={20}
                                color={
                                  item.value.signatures.tenant.status ===
                                  "SIGNED"
                                    ? "#4CAF50"
                                    : "#FFA500"
                                }
                              />
                              <Text style={styles.signatureText}>
                                Người thuê:{" "}
                                {item.value.signatures.tenant.status ===
                                "SIGNED"
                                  ? "Đã ký"
                                  : "Chưa ký"}
                              </Text>
                            </View>
                          )}
                          {item.value.fullySignedHash && (
                            <View style={styles.hashContainer}>
                              <Text style={styles.hashLabel}>
                                Fully Signed Hash:
                              </Text>
                              <Text
                                style={[
                                  styles.hashValue,
                                  styles.fullySignedHash,
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="middle"
                              >
                                {item.value.fullySignedHash}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Extensions */}
                      {item.value.extensions &&
                        item.value.extensions.length > 0 && (
                          <View style={styles.extensionsSection}>
                            <Text style={styles.sectionTitle}>
                              Gia hạn ({item.value.extensions.length})
                            </Text>
                            {item.value.extensions.map((ext, idx) => (
                              <View key={idx} style={styles.extensionItem}>
                                <Text style={styles.extensionText}>
                                  Lần {ext.extensionNumber}:{" "}
                                  {formatCurrency(ext.newRentAmount)}/tháng
                                </Text>
                                <Text style={styles.extensionDate}>
                                  Đến{" "}
                                  {new Date(ext.newEndDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                      {/* Penalties */}
                      {item.value.penalties &&
                        item.value.penalties.length > 0 && (
                          <View style={styles.penaltiesSection}>
                            <Text style={styles.sectionTitle}>
                              Phạt ({item.value.penalties.length})
                            </Text>
                            {item.value.penalties.map((penalty, idx) => (
                              <View key={idx} style={styles.penaltyItem}>
                                <Text style={styles.penaltyAmount}>
                                  {formatCurrency(penalty.amount)}
                                </Text>
                                <Text style={styles.penaltyReason}>
                                  {penalty.reason}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                    </View>
                  ))}
              </View>
            )}
          </>
        )}

        {/* Payment Search Tab */}
        {activeTab === "payment" && (
          <>
            {/* Payment Status Selector */}
            <View style={styles.paymentStatusContainer}>
              <Text style={styles.paymentStatusLabel}>
                Trạng thái thanh toán:
              </Text>
              <View style={styles.paymentStatusButtons}>
                {(["SCHEDULED", "PAID", "OVERDUE"] as PaymentStatus[]).map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusFilterButton,
                        paymentStatus === status &&
                          styles.statusFilterButtonActive,
                      ]}
                      onPress={() => setPaymentStatus(status)}
                    >
                      <Text
                        style={[
                          styles.statusFilterText,
                          paymentStatus === status &&
                            styles.statusFilterTextActive,
                        ]}
                      >
                        {status === "PAID"
                          ? "Đã TT"
                          : status === "SCHEDULED"
                          ? "Lên lịch"
                          : "Quá hạn"}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Search Button */}
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  loading && styles.searchButtonDisabled,
                ]}
                onPress={handleSearchPayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={20} color="#fff" />
                    <Text style={styles.searchButtonText}>
                      Tra cứu thanh toán
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Payment History Results */}
            {paymentHistory && paymentHistory.data.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  Tìm thấy {paymentHistory.data.length} thanh toán
                </Text>

                {paymentHistory.data
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((payment) => (
                    <View key={payment.paymentId} style={styles.historyCard}>
                      {/* Card Header */}
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderTitle}>
                          Thanh toán kỳ {payment.period}
                        </Text>
                        {getPaymentStatusBadge(payment.status)}
                      </View>

                      {/* Payment Info */}
                      <Text style={styles.cardTimestamp}>
                        <MaterialIcons
                          name="access-time"
                          size={14}
                          color="#666"
                        />{" "}
                        {formatDate(payment.createdAt)}
                      </Text>

                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Payment ID:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.paymentId}
                        </Text>
                      </View>

                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Số tiền:</Text>
                        <Text style={[styles.infoValue, styles.priceHighlight]}>
                          {formatCurrency(payment.amount)}
                        </Text>
                      </View>

                      {payment.paidAmount && (
                        <View style={styles.infoSection}>
                          <Text style={styles.infoLabel}>Đã thanh toán:</Text>
                          <Text style={styles.infoValue}>
                            {formatCurrency(payment.paidAmount)}
                          </Text>
                        </View>
                      )}

                      <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>Hạn thanh toán:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(payment.dueDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Text>
                      </View>

                      {payment.paidAt && (
                        <View style={styles.infoSection}>
                          <Text style={styles.infoLabel}>Đã TT lúc:</Text>
                          <Text style={styles.infoValue}>
                            {formatDate(payment.paidAt)}
                          </Text>
                        </View>
                      )}

                      {payment.overdueAt && (
                        <View style={styles.infoSection}>
                          <Text style={styles.infoLabel}>Quá hạn lúc:</Text>
                          <Text
                            style={[styles.infoValue, { color: "#F44336" }]}
                          >
                            {formatDate(payment.overdueAt)}
                          </Text>
                        </View>
                      )}

                      {/* Penalties */}
                      {payment.penalties && payment.penalties.length > 0 && (
                        <View style={styles.penaltiesSection}>
                          <Text style={styles.sectionTitle}>Phạt</Text>
                          {payment.penalties.map((penalty, idx) => (
                            <View key={idx} style={styles.penaltyItem}>
                              <Text style={styles.penaltyAmount}>
                                {formatCurrency(penalty.amount)}
                              </Text>
                              <Text style={styles.penaltyReason}>
                                {penalty.reason}
                              </Text>
                              <Text style={styles.penaltyPolicy}>
                                Policy: {penalty.policyRef}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !contractHistory && !paymentHistory && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === "contract"
                ? "Nhập mã hợp đồng để tra cứu lịch sử blockchain"
                : "Tra cứu hợp đồng trước để xem lịch thanh toán"}
            </Text>
            <Text style={styles.emptySubtext}>
              Tất cả giao dịch được lưu trữ trên blockchain
            </Text>
          </View>
        )}
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
  infoButton: {
    padding: 8,
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
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071658",
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  orgInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f0f7ff",
    borderBottomWidth: 1,
    borderBottomColor: "#d0e7ff",
  },
  orgInfoText: {
    fontSize: 14,
    color: "#666",
  },
  orgInfoBold: {
    fontWeight: "700",
    color: "#fba31d",
  },
  paymentStatusContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  paymentStatusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  paymentStatusButtons: {
    flexDirection: "row",
    gap: 12,
  },
  statusFilterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  statusFilterButtonActive: {
    backgroundColor: "#071658",
    borderColor: "#071658",
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  statusFilterTextActive: {
    color: "#fff",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#F44336",
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardHeaderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#071658",
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  latestBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  latestBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  cardTimestamp: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  cardTxId: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "right",
  },
  priceHighlight: {
    color: "#fba31d",
    fontSize: 16,
  },
  signaturesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  signatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 14,
    color: "#666",
  },
  hashContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  hashLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  hashValue: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#1a1a1a",
    lineHeight: 16,
  },
  fullySignedHash: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  extensionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  extensionItem: {
    marginBottom: 8,
  },
  extensionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  extensionDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  penaltiesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  penaltyItem: {
    marginBottom: 8,
  },
  penaltyAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
  penaltyReason: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  penaltyPolicy: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
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
  },
});
