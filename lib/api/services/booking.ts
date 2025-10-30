/**
 * Booking API Service
 * Xử lý tất cả các API calls liên quan đến booking/rental requests
 */

import { apiClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * API Request Types
 */

export interface CreateBookingDto {
  propertyId?: string; // Required cho apartment, optional cho boarding
  roomId?: string; // Required cho boarding, optional cho apartment
}

/**
 * API Response Types
 */

/**
 * User information interface - dùng chung cho cả tenant và landlord
 */
export interface BookingUserInfo {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  isVerified: boolean;
  avatarUrl: string | null;
  status: string;
  CCCD: string | null;
  createdAt: string;
  updatedAt: string;
}

// Type aliases để code dễ đọc hơn
export type BookingUser = BookingUserInfo;
export type BookingLandlord = BookingUserInfo;

/**
 * Room Type information - Loại phòng cho boarding house
 */
export interface BookingRoomType {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  price: string;
  deposit: string;
  furnishing: string;
  images: string[];
  description: string;
  heroImage: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Room information - Phòng cụ thể trong boarding house
 */
export interface BookingRoom {
  id: string;
  name: string;
  roomType: BookingRoomType;
  isVisible: boolean;
  floor: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Property Unit information - Căn hộ trong apartment
 */
export interface BookingPropertyUnit {
  id: string;
  name: string;
  price: string;
  area: number;
  floor: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: string | null;
  status: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  province: string;
  ward: string;
  address: string;
  block: string | null;
  furnishing: string | null;
  legalDoc: string | null;
  price: number | null; // Giá cho apartment
  deposit: string | null;
  electricityPricePerKwh: string | null;
  waterPricePerM3: string | null;
  area: number | null; // Diện tích cho apartment
  bedrooms: number | null; // Số phòng ngủ cho apartment
  bathrooms: number | null; // Số phòng tắm cho apartment
  mapLocation: string | null;
  isVisible: boolean;
  isApproved: boolean;
  heroImage: string | null;
  images: string[] | null;
  floor: number | null;
  landlord: BookingLandlord;
  unit: BookingPropertyUnit | null; // Hiện tại không dùng, luôn null
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "PENDING_LANDLORD" // Tenant gửi yêu cầu, chờ landlord duyệt
  | "REJECTED" // Landlord từ chối
  | "PENDING_SIGNATURE" // Landlord đồng ý, chờ tenant ký
  | "AWAITING_DEPOSIT" // Chờ đặt cọc
  | "ESCROW_FUNDED_T" // Tenant đã đặt cọc
  | "ESCROW_FUNDED_L" // Landlord đã đặt cọc
  | "DUAL_ESCROW_FUNDED" // Cả hai bên đã đặt cọc
  | "READY_FOR_HANDOVER" // Sẵn sàng bàn giao
  | "ACTIVE" // Đang hoạt động
  | "SETTLEMENT_PENDING" // Chờ thanh toán
  | "SETTLED" // Đã thanh toán
  | "CANCELLED"; // Đã hủy

export type BookingCondition =
  | "NOT_APPROVED_YET" // Chờ duyệt (PENDING_LANDLORD)
  | "NOT_APPROVED" // Từ chối (REJECTED)
  | "APPROVED"; // Đã duyệt (APPROVED)

export interface BookingContract {
  id: string;
  contractCode: string;
  tenant?: { id: string };
  landlord?: { id: string };
  property?: { id: string };
  room?: { id: string } | null;
  startDate: string;
  endDate: string;
  status: string;
  contractFileUrl: string | null;
  blockchainTxHash: string | null;
  smartContractAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  tenant: BookingUser;
  property: BookingProperty;
  room: BookingRoom | null; // Có cho boarding house, null cho apartment
  status: BookingStatus;
  contractId: string | null;
  contract?: BookingContract | null; // Contract details khi approve
  signedAt: string | null;
  escrowDepositDueAt: string | null;
  escrowDepositFundedAt: string | null;
  firstRentDueAt: string | null;
  landlordEscrowDepositDueAt: string | null;
  landlordEscrowDepositFundedAt: string | null;
  firstRentPaidAt: string | null;
  handoverAt: string | null;
  activatedAt: string | null;
  closedAt: string | null;
  signedPdfUrl?: string; // URL của file PDF đã ký
  createdAt: string;
  updatedAt: string;
}
export enum signingOption {
  VNPT = "VNPT",
  SELF_CA = "SELF_CA",
}
/**
 * Booking Service Class
 */
export class BookingService {
  private basePath = "/bookings";

  /**
   * Tạo booking/yêu cầu thuê mới
   * POST /bookings
   */
  async createBooking(data: CreateBookingDto): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(this.basePath, data);
  }

  /**
   * Lấy danh sách bookings của user hiện tại
   * GET /bookings/me?condition=NOT_APPROVED_YET|NOT_APPROVED|APPROVED
   */
  async getMyBookings(
    condition?: BookingCondition
  ): Promise<ApiResponse<Booking[]>> {
    const params: Record<string, string> = {};
    if (condition) {
      params.condition = condition;
    }
    return apiClient.get<Booking[]>(`${this.basePath}/me`, params);
  }

  /**
   * Lấy chi tiết một booking
   * GET /bookings/:id
   */
  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.get<Booking>(`${this.basePath}/${id}`);
  }

  /**
   * Hủy booking
   * PATCH /bookings/:id/cancel
   */
  async cancelBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.patch<Booking>(`${this.basePath}/${id}/cancel`);
  }

  /**
   * Chủ nhà phê duyệt booking
   * PATCH /bookings/:id/approve
   */
  async approveBooking(
    id: string,
    signingOption: signingOption
  ): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(`${this.basePath}/${id}/approve`, {
      signingOption,
    });
  }

  /**
   * Chủ nhà từ chối booking
   * PATCH /bookings/:id/reject
   */
  async rejectBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(`${this.basePath}/${id}/reject`);
  }
  // người thuê kí hợp đồng booking
  async signContract(
    id: string,
    signingOption: signingOption
  ): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(`${this.basePath}/${id}/sign`, {
      signingOption,
    });
  }
  //Bàn giao phòng
  async handover(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(`${this.basePath}/${id}/handover`);
  }
}

// Export singleton instance
export const bookingService = new BookingService();
