import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface InvoiceContract {
  id: string;
  contractCode: string;
  startDate: string;
  endDate: string;
  status: string;
  contractFileUrl: string;
  blockchainTxHash: string | null;
  smartContractAddress: string | null;
  transactionIdTenantSign: string | null;
  transactionIdLandlordSign: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  contract: InvoiceContract;
  items: InvoiceItem[];
  payment: unknown | null;
  totalAmount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  billingPeriod: string; // Định dạng YYYY-MM
  createdAt: string;
  updatedAt: string;
}
export interface ExtractedData {
  name: string;
  value: string;
  confidence: number;
}

export interface RawData {
  entitiesCount: number;
  documentText: string;
  processedAt: string;
}
export interface ProcessInvoiceResponse {
  extractedData: ExtractedData[];
  rawData: RawData;
}
export interface CreateInvoiceRequest {
  contractId: string;
  dueDate: string;
  items: {
    description: string;
    amount: number;
    serviceType: ServiceTypeEnum;
  }[];
  billingPeriod?: string; // Định dạng YYYY-MM
}

/**
 * Các loại dịch vụ cho hóa đơn phòng trọ
 */
export enum ServiceTypeEnum {
  ELECTRICITY = "ELECTRICITY", // Tiền điện
  WATER = "WATER", // Tiền nước
  PARKING = "PARKING", // Tiền giữ xe
  INTERNET = "INTERNET", // Tiền internet
  CLEANING = "CLEANING", // Tiền vệ sinh
  SECURITY = "SECURITY", // Tiền bảo vệ
  OTHER = "OTHER", // Khác
}

/**
 * Interface cho một mục dịch vụ trong hóa đơn
 * (Tương ứng với ServiceItemDto ở backend)
 */
export interface ServiceItem {
  serviceType: ServiceTypeEnum;
  amount?: number;
  description?: string;
  KwhNo?: number; // Chỉ dùng cho ELECTRICITY
  M3No?: number; // Chỉ dùng cho WATER
}

/**
 * Interface cho request tạo hóa đơn phòng trọ (Utility Bill)
 */
export interface CreateUtilityBillRequest {
  contractId: string;
  dueDate: string; // Ví dụ: "2025-01-31"
  billingPeriod: string; // Ví dụ: "2025-01"
  services: ServiceItem[];
}

export class InvoiceService {
  private basePath = "/invoices";
  async createInvoice(
    request: CreateInvoiceRequest
  ): Promise<ApiResponse<Invoice>> {
    const now = new Date();
    const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    request.billingPeriod = yyyyMM;
    return apiClient.post<Invoice>(this.basePath, request);
  }
  async createUtilityBill(
    request: CreateUtilityBillRequest
  ): Promise<ApiResponse<Invoice>> {
    return apiClient.post<Invoice>(`${this.basePath}/utility-bill`, request);
  }

  async getInvoiceByContractId(
    contractId: string
  ): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(`${this.basePath}/contract/${contractId}`);
  }

  async getInvoiceById(invoiceId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${this.basePath}/${invoiceId}`);
  }
  async processInvoice(
    invoiceFile: File
  ): Promise<ApiResponse<ProcessInvoiceResponse>> {
    const formData = new FormData();
    formData.append("invoice", invoiceFile);
    return apiClient.post<ProcessInvoiceResponse>(
      `${this.basePath}/process-invoice`,
      formData
    );
  }
}
export const invoiceService = new InvoiceService();
