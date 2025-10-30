import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { invoiceService, type Invoice } from "@/lib/api/services/invoice";
import { paymentService } from "@/lib/api/services/payment";
import { useWallet } from "@/hooks/use-wallet";

interface InvoicePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  invoiceId: string;
  onPaymentSuccess: () => void;
}

export function InvoicePaymentModal({
  visible,
  onClose,
  invoiceId,
  onPaymentSuccess,
}: InvoicePaymentModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"WALLET" | "VNPAY">(
    "WALLET"
  );

  const { balance, refreshBalance } = useWallet();

  useEffect(() => {
    if (visible && invoiceId) {
      loadInvoiceDetail();
    }
  }, [visible, invoiceId]);

  const loadInvoiceDetail = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoiceById(invoiceId);

      if (response.code === 200 && response.data) {
        setInvoice(response.data);
      } else {
        throw new Error(response.message || "Không thể tải thông tin hóa đơn");
      }
    } catch (error: any) {
      console.error("Error loading invoice:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải thông tin hóa đơn");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;

    // Kiểm tra số dư nếu thanh toán bằng ví
    if (selectedMethod === "WALLET") {
      if (!balance || balance < invoice.totalAmount) {
        Alert.alert(
          "Số dư không đủ",
          "Số dư trong ví không đủ để thanh toán hóa đơn này. Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác.",
          [
            { text: "Chọn VNPAY", onPress: () => setSelectedMethod("VNPAY") },
            { text: "Đóng", style: "cancel" },
          ]
        );
        return;
      }

      // Xác nhận thanh toán bằng ví
      Alert.alert(
        "💳 Xác nhận thanh toán",
        `Bạn có chắc chắn muốn thanh toán hóa đơn bằng ví điện tử?\n\n📋 Chi tiết giao dịch:\n• Số tiền: ${formatCurrency(
          invoice.totalAmount
        )}\n• Phương thức: Ví điện tử\n• Hóa đơn: ${
          invoice.invoiceCode
        }\n\n💰 Số dư ví:\n• Hiện tại: ${formatCurrency(
          balance
        )}\n• Sau thanh toán: ${formatCurrency(balance - invoice.totalAmount)}`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xác nhận thanh toán", onPress: processPayment },
        ]
      );
    } else {
      // Thanh toán bằng VNPAY
      processPayment();
    }
  };

  const processPayment = async () => {
    if (!invoice) return;

    try {
      setPaymentLoading(true);
      const response = await paymentService.createPaymentByInvoice(
        invoice.id,
        selectedMethod
      );

      if (response.code === 200 && response.data) {
        if (selectedMethod === "WALLET") {
          // Thanh toán ví thành công
          Alert.alert(
            "🎉 Thanh toán thành công!",
            `Hóa đơn đã được thanh toán bằng ví điện tử.\n\nSố tiền: ${formatCurrency(
              invoice.totalAmount
            )}\nPhương thức: Ví điện tử\nThời gian: ${new Date().toLocaleString(
              "vi-VN"
            )}`,
            [
              {
                text: "Xem ví của tôi",
                onPress: () => {
                  refreshBalance(); // Refresh wallet balance
                  onPaymentSuccess();
                  onClose();
                  // TODO: Navigate to wallet screen
                },
              },
              {
                text: "OK",
                onPress: () => {
                  refreshBalance(); // Refresh wallet balance
                  onPaymentSuccess();
                  onClose();
                },
              },
            ]
          );
        } else {
          // Chuyển hướng đến VNPAY
          if (response.data.paymentUrl) {
            // TODO: Mở trình duyệt hoặc WebView để thanh toán VNPAY
            Alert.alert(
              "Chuyển hướng thanh toán",
              "Bạn sẽ được chuyển đến trang thanh toán VNPAY",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // TODO: Implement VNPAY redirect
                    console.log("VNPAY URL:", response.data?.paymentUrl);
                    onClose();
                  },
                },
              ]
            );
          }
        }
      } else {
        throw new Error(response.message || "Thanh toán thất bại");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert(
        "❌ Lỗi thanh toán",
        `Không thể thực hiện thanh toán:\n\n${
          error.message || "Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
        }\n\nMã lỗi: ${error.code || "UNKNOWN"}`,
        [
          { text: "Thử lại", onPress: () => handlePayment() },
          { text: "Đóng", style: "cancel" },
        ]
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>
                Đang tải thông tin hóa đơn...
              </Text>
            </View>
          ) : invoice ? (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Invoice Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin hóa đơn</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã hóa đơn:</Text>
                    <Text style={styles.infoValue}>{invoice.invoiceCode}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kỳ thanh toán:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(invoice.billingPeriod).toLocaleDateString(
                        "vi-VN",
                        {
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hạn thanh toán:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(invoice.dueDate)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <View
                      style={[
                        styles.statusBadge,
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
                          styles.statusText,
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
                          ? "Đã thanh toán"
                          : invoice.status === "OVERDUE"
                          ? "Quá hạn"
                          : "Chưa thanh toán"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Invoice Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  📋 Chi tiết dịch vụ ({invoice.items.length} mục)
                </Text>
                <View style={styles.itemsContainer}>
                  {invoice.items.map((item, index) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemLeft}>
                        <View style={styles.itemNumber}>
                          <Text style={styles.itemNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.itemContent}>
                          <Text style={styles.itemDescription}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={styles.itemAmount}>
                          {formatCurrency(item.amount)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Subtotal if there are multiple items */}
                  {invoice.items.length > 1 && (
                    <View style={styles.subtotalRow}>
                      <Text style={styles.subtotalLabel}>Tạm tính:</Text>
                      <Text style={styles.subtotalAmount}>
                        {formatCurrency(
                          invoice.items.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          )
                        )}
                      </Text>
                    </View>
                  )}

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(invoice.totalAmount)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payment Method */}
              {invoice.status !== "PAID" && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Phương thức thanh toán
                  </Text>
                  <View style={styles.paymentMethods}>
                    <TouchableOpacity
                      style={[
                        styles.paymentMethod,
                        selectedMethod === "WALLET" && styles.selectedMethod,
                      ]}
                      onPress={() => setSelectedMethod("WALLET")}
                    >
                      <MaterialIcons
                        name="account-balance-wallet"
                        size={24}
                        color={selectedMethod === "WALLET" ? "#2196F3" : "#666"}
                      />
                      <View style={styles.paymentMethodContent}>
                        <Text
                          style={[
                            styles.paymentMethodTitle,
                            selectedMethod === "WALLET" &&
                              styles.selectedMethodText,
                          ]}
                        >
                          Ví điện tử
                        </Text>
                        <Text style={styles.paymentMethodSubtitle}>
                          Số dư khả dụng: {formatCurrency(balance || 0)}
                        </Text>
                        {balance && balance < invoice.totalAmount && (
                          <Text style={styles.insufficientText}>
                            Số dư không đủ
                          </Text>
                        )}
                      </View>
                      {selectedMethod === "WALLET" && (
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color="#2196F3"
                        />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.paymentMethod,
                        selectedMethod === "VNPAY" && styles.selectedMethod,
                      ]}
                      onPress={() => setSelectedMethod("VNPAY")}
                    >
                      <MaterialIcons
                        name="credit-card"
                        size={24}
                        color={selectedMethod === "VNPAY" ? "#2196F3" : "#666"}
                      />
                      <View style={styles.paymentMethodContent}>
                        <Text
                          style={[
                            styles.paymentMethodTitle,
                            selectedMethod === "VNPAY" &&
                              styles.selectedMethodText,
                          ]}
                        >
                          VNPAY
                        </Text>
                        <Text style={styles.paymentMethodSubtitle}>
                          Thanh toán qua ngân hàng
                        </Text>
                      </View>
                      {selectedMethod === "VNPAY" && (
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color="#2196F3"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="error-outline" size={48} color="#F44336" />
              <Text style={styles.loadingText}>
                Không thể tải thông tin hóa đơn
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={loadInvoiceDetail}
              >
                <Text style={styles.cancelButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          {invoice && invoice.status !== "PAID" && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={paymentLoading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  paymentLoading && styles.disabledButton,
                ]}
                onPress={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.payButtonText}>Thanh toán</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    flex: 1,
    marginTop: "10%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 12,
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 15,
    color: "#212121",
    fontWeight: "600",
    marginBottom: 2,
  },
  itemId: {
    fontSize: 12,
    color: "#666",
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
  },
  subtotalLabel: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  subtotalAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976D2",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976D2",
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    gap: 12,
  },
  selectedMethod: {
    borderColor: "#2196F3",
    backgroundColor: "#F3F8FF",
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  selectedMethodText: {
    color: "#2196F3",
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  insufficientText: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  payButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
