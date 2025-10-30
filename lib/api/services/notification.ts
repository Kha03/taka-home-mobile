/**
 * Notification Service - Quản lý thông báo
 */

import { apiClient } from "../client";
import type { ApiResponse, NotificationResponse } from "../types";

export class NotificationService {
  private readonly baseUrl = "/notifications";

  /**
   * Lấy danh sách thông báo theo userId
   */
  async findAllByUserId(
    userId: string
  ): Promise<ApiResponse<NotificationResponse[]>> {
    const response = await apiClient.get<NotificationResponse[]>(
      `${this.baseUrl}/user/${userId}`
    );
    return response;
  }

  /**
   * Đánh dấu thông báo đã hoàn thành
   */
  async markAsCompleted(
    id: string
  ): Promise<ApiResponse<NotificationResponse>> {
    const response = await apiClient.patch<NotificationResponse>(
      `${this.baseUrl}/${id}/read`
    );
    return response;
  }

  /**
   * Đánh dấu tất cả thông báo đã hoàn thành cho user
   */
  async markAllAsCompleted(
    userId: string
  ): Promise<ApiResponse<{ count: number }>> {
    const response = await apiClient.patch<{ count: number }>(
      `${this.baseUrl}/user/${userId}/read-all`
    );
    return response;
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`${this.baseUrl}/${id}`);
    return response;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
