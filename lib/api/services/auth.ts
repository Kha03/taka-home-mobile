/**
 * Auth API Service
 * Quản lý các API calls liên quan đến xác thực và người dùng
 */

import { apiClient } from "../client";
import type {
  ApiResponse,
  Account,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
} from "../types";

export class AuthService {
  /**
   * Đăng nhập
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);

    // Tự động set token vào client nếu login thành công
    if (response.code === 200 && response.data?.accessToken) {
      apiClient.setAuthToken(response.data.accessToken);
      // Lưu token và account info vào localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem(
          "account_info",
          JSON.stringify(response.data.account)
        );
      }
    }

    return response;
  }

  /**
   * Đăng ký
   */
  async register(
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/register",
      data
    );
    return response;
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>("/auth/logout");

      // Xóa token khỏi client và localStorage
      apiClient.removeAuthToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("account_info");
      }

      return response;
    } catch (error) {
      // Vẫn xóa token local dù API call fail
      apiClient.removeAuthToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("account_info");
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin account hiện tại
   */
  async getCurrentUser(): Promise<ApiResponse<Account>> {
    return apiClient.get<Account>("/auth/me");
  }

  /**
   * Cập nhật thông tin user
   */
  async updateProfile(
    data: Partial<Pick<User, "fullName" | "avatarUrl">>
  ): Promise<ApiResponse<User>> {
    return apiClient.put<User>("/auth/profile", data);
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/change-password", data);
  }

  /**
   * Gửi email reset mật khẩu
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/forgot-password", { email });
  }

  /**
   * Reset mật khẩu với token
   */
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/reset-password", data);
  }

  /**
   * Refresh token (chưa implement ở backend)
   */
  async refreshToken(
    refreshToken?: string
  ): Promise<ApiResponse<AuthResponse>> {
    const token =
      refreshToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null);

    if (!token) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
      refreshToken: token,
    });

    // Cập nhật token mới
    if (response.code === 200 && response.data?.accessToken) {
      apiClient.setAuthToken(response.data.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem(
          "account_info",
          JSON.stringify(response.data.account)
        );
      }
    }

    return response;
  }

  /**
   * Xác thực email
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/verify-email", { token });
  }

  /**
   * Gửi lại email xác thực
   */
  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/resend-verification");
  }

  /**
   * Khởi tạo token từ localStorage (khi reload trang)
   */
  initializeAuth(): void {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        apiClient.setAuthToken(token);
      }
    }
  }

  /**
   * Kiểm tra xem user có đang đăng nhập không
   */
  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("accessToken");
    }
    return false;
  }
}

// Create singleton instance
export const authService = new AuthService();
