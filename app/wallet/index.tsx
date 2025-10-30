import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWallet } from "@/hooks/use-wallet";
import {
  paymentService,
  type WalletHistoryResponse,
} from "@/lib/api/services/payment";

export default function WalletScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Transaction states
  const [transactions, setTransactions] = useState<WalletHistoryResponse[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
    refreshBalance,
  } = useWallet();

  // Fetch transactions function
  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const response = await paymentService.getWalletHistory();
      if (response.code === 200 && response.data) {
        // Sort by date descending (newest first)
        const sortedTransactions = response.data.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.createdAt).getTime();
          const dateB = new Date(b.completedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        setTransactions(sortedTransactions);
      } else {
        throw new Error(response.message || "Không thể tải lịch sử giao dịch");
      }
    } catch (err) {
      setTransactionsError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải lịch sử giao dịch"
      );
      console.error("Error fetching wallet history:", err);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshBalance(), refreshTransactions()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "add-circle";
      case "withdraw":
        return "remove-circle";
      case "payment":
        return "payment";
      case "refund":
        return "refresh";
      default:
        return "account-balance-wallet";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "deposit":
      case "refund":
        return "#4CAF50";
      case "withdraw":
      case "payment":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "failed":
      case "cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "Thành công";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleTopUp = () => {
    Alert.alert("Nạp tiền", "Tính năng sắp ra mắt!");
    Alert.alert("Thông báo", "Tính năng nạp tiền sẽ được cập nhật sớm!");
  };

  const handleWithdraw = () => {
    Alert.alert("Rút tiền", "Tính năng sắp ra mắt!");
    Alert.alert("Thông báo", "Tính năng rút tiền sẽ được cập nhật sớm!");
  };

  if (balanceError || transactionsError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ví của tôi</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>
            {balanceError || transactionsError}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví của tôi</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          {balanceLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <Text style={styles.balanceAmount}>
              {formatCurrency(balance || 0)}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTopUp}>
              <MaterialIcons name="add" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Nạp tiền</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWithdraw}
            >
              <MaterialIcons name="remove" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Rút tiền</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        </View>

        {transactionsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Đang tải lịch sử giao dịch...
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            <Text style={styles.emptySubtext}>
              Các giao dịch của bạn sẽ hiển thị tại đây
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <MaterialIcons
                    name={getTransactionIcon(transaction.type)}
                    size={24}
                    color={getTransactionColor(transaction.type)}
                  />
                </View>
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionTitle}>
                    {transaction.note || transaction.type}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                  <View style={styles.transactionStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(transaction.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(transaction.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amountText,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {transaction.type?.toLowerCase() === "withdraw" ||
                    transaction.type?.toLowerCase() === "payment"
                      ? "-"
                      : "+"}
                    {formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                  </Text>
                </View>
              </View>
            ))}
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
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  emptyContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  transactionList: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  transactionStatus: {
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
