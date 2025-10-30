/**
 * Property Service
 * Xử lý các API calls liên quan đến properties
 */

import { apiClient } from "../client";
import type {
  ApiResponse,
  FilterPropertyQuery,
  Property,
  PropertyCreateRequest,
  RoomTypeDetail,
  MoveRoomRequest,
  PropertyRoom,
} from "../types";

export class PropertyService {
  private basePath = "/properties";

  /**
   * Tạo property mới
   */
  async createProperty(
    data: PropertyCreateRequest
  ): Promise<ApiResponse<Property>> {
    return await apiClient.post<Property>(this.basePath, data);
  }

  /**
   * Lấy danh sách properties với phân trang và filter
   */
  async getProperties(
    params?: FilterPropertyQuery
  ): Promise<ApiResponse<Property[]>> {
    return await apiClient.get<Property[]>(
      `${this.basePath}/filter`,
      params as Record<string, unknown>
    );
  }

  /**
   * Lấy chi tiết một property theo ID
   */
  async getPropertyById(id: string): Promise<ApiResponse<Property>> {
    return await apiClient.get<Property>(`${this.basePath}/${id}`);
  }

  /**
   * Cập nhật property
   */
  async updateProperty(
    id: string,
    data: Partial<PropertyCreateRequest>
  ): Promise<ApiResponse<Property>> {
    return await apiClient.put<Property>(`${this.basePath}/${id}`, data);
  }

  /**
   * Cập nhật apartment (PATCH)
   */
  async updateApartment(
    id: string,
    data: {
      title?: string;
      description?: string;
      province?: string;
      ward?: string;
      address?: string;
      block?: string;
      unit?: string;
      area?: number;
      bedrooms?: number;
      bathrooms?: number;
      price?: number;
      deposit?: number;
      furnishing?: string;
    }
  ): Promise<ApiResponse<Property>> {
    return await apiClient.patch<Property>(
      `${this.basePath}/apartment/${id}`,
      data
    );
  }

  /**
   * Xóa property
   */
  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Lấy properties của user hiện tại
   */
  async getMyProperties(): Promise<ApiResponse<Property[]>> {
    return await apiClient.get<Property[]>(`${this.basePath}/me`);
  }

  /**
   * Lấy properties cho admin (filter theo isApproved)
   */
  async getPropertiesForAdmin(
    params?: FilterPropertyQuery
  ): Promise<ApiResponse<Property[]>> {
    return await apiClient.get<Property[]>(
      `${this.basePath}/filter`,
      params as Record<string, unknown>
    );
  }

  /**
   * Duyệt property (admin)
   */
  async approveProperties(
    propertyId: string[]
  ): Promise<ApiResponse<Property>> {
    return await apiClient.patch<Property>(`${this.basePath}/approve`, {
      propertyIds: propertyId,
    });
  }

  async uploadPropertyImages(
    propertyId: string,
    entityType: "APARTMENT" | "BOARDING",
    heroImage?: File,
    images?: File[]
  ): Promise<ApiResponse<Property>> {
    const formData = new FormData();

    formData.append("entityType", entityType);

    if (heroImage) {
      formData.append("heroImage", heroImage);
    }

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    return await apiClient.post<Property>(
      `${this.basePath}/${propertyId}/images`,
      formData
    );
  }

  /**
   * Lấy chi tiết một room type theo ID
   */
  async getRoomTypeById(id: string): Promise<ApiResponse<RoomTypeDetail>> {
    return await apiClient.get<RoomTypeDetail>(
      `${this.basePath}/roomtype/${id}`
    );
  }

  /**
   * Chuyển room sang room type khác
   * Chỉ được phép khi room chưa cho thuê (isVisible = false)
   *
   * Hỗ trợ 2 chế độ:
   * 1. Chuyển vào RoomType có sẵn: truyền targetRoomTypeId
   * 2. Tạo RoomType mới và chuyển Room vào: set createNewRoomType=true và truyền thông tin RoomType mới
   *
   * @param roomId - ID của room cần chuyển
   * @param data - Thông tin RoomType đích hoặc thông tin RoomType mới
   * @returns Promise<ApiResponse<PropertyRoom>> - Room sau khi chuyển
   */
  async moveRoom(
    roomId: string,
    data: MoveRoomRequest
  ): Promise<ApiResponse<PropertyRoom>> {
    return await apiClient.patch<PropertyRoom>(
      `${this.basePath}/rooms/${roomId}/move`,
      data
    );
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
