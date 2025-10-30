import { apiClient } from "../client";
import { ApiResponse } from "../types";

export interface CreatePaymentDto {
  contractId?: string;
  amount: number;
  method: "VNPAY" | "WALLET";
  purpose: PaymentPurpose;
}
export enum PaymentPurpose {
  WALLET_TOPUP = "WALLET_TOPUP", // Nạp tiền vào ví
  TENANT_ESCROW_DEPOSIT = "TENANT_ESCROW_DEPOSIT", // người thuê nộp cọc
  LANDLORD_ESCROW_DEPOSIT = "LANDLORD_ESCROW_DEPOSIT", // chủ nhà nộp cọc
  FIRST_MONTH_RENT = "FIRST_MONTH_RENT", // Tiền thuê tháng đầu
  MONTHLY_RENT = "MONTHLY_RENT", // Tiền thuê hàng tháng
  TENANT_EXTENSION_ESCROW_DEPOSIT = "TENANT_EXTENSION_ESCROW_DEPOSIT", // người thuê nộp cọc gia hạn
  LANDLORD_EXTENSION_ESCROW_DEPOSIT = "LANDLORD_EXTENSION_ESCROW_DEPOSIT", // chủ nhà nộp cọc gia hạn
}

export interface PaymentResponse {
  id: string;
  contractId: string;
  amount: number;
  method: string;
  status: PaymentStatusEnum;
  paymentUrl: string;
  txnRef: string;
}
export enum PaymentStatusEnum {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}
export interface WalletResponse {
  walletId: string;
  availableBalance: number;
  currency: string;
  updatedAt: string;
}
export interface WalletHistoryResponse {
  id: string;
  walletId: string;
  direction: "CREDIT" | "DEBIT";
  type: "TOPUP" | "CONTRACT_PAYMENT" | "REFUND";
  amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  refId: string;
  note: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}
export class PaymentService {
  private basePath = "/payments";
  async createPayment(
    dto: CreatePaymentDto
  ): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(`${this.basePath}`, dto);
  }
  async createPaymentByInvoice(
    invoiceId: string,
    method: "VNPAY" | "WALLET"
  ): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(
      `${this.basePath}/invoice/${invoiceId}`,
      { method }
    );
  }
  async getWalletMe(): Promise<ApiResponse<WalletResponse>> {
    return apiClient.get<WalletResponse>(`/wallet/me`);
  }
  async getWalletHistory(): Promise<ApiResponse<WalletHistoryResponse[]>> {
    return apiClient.get<WalletHistoryResponse[]>(`/wallet/transactions`);
  }
}
export const paymentService = new PaymentService();
