/**
 * Base API Client cho Taka Home với Axios
 * Cung cấp các phương thức HTTP với interceptors và error handling mạnh mẽ
 */

import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "./config";
import type { ApiResponse } from "./types";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  data?: unknown;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup interceptors cho request/response handling
   */
  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add accessToken  nếu có
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // If sending FormData, remove Content-Type header
        // Let browser set it automatically with boundary
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }

        console.log(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            data: config.data instanceof FormData ? "FormData" : config.data,
            params: config.params,
          }
        );

        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        console.error(
          `❌ API Error: ${error.response?.status}`,
          error.response?.data
        );

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = "/signin";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  removeAuthToken() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  /**
   * Transform Axios response thành ApiResponse format
   */
  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    const data = response.data;

    // Nếu response đã theo format ApiResponse
    if (typeof data.code === "number" && typeof data.message === "string") {
      return data as ApiResponse<T>;
    }

    // Nếu không, wrap response
    return {
      code: response.status,
      message: response.statusText || "Success",
      data: data,
    };
  }

  /**
   * Handle Axios errors
   */
  private handleError(error: AxiosError): never {
    if (error.response) {
      // Server trả về error response
      const data = error.response.data as Record<string, unknown>;

      const apiError: ApiError = {
        message: (data?.message as string) || error.message || "Có lỗi xảy ra",
        status: error.response.status,
        code:
          (data?.code as number)?.toString() ||
          error.response.status.toString(),
        data: data,
      };

      throw apiError;
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      throw {
        message: "Không thể kết nối đến server",
        status: 0,
        code: "NETWORK_ERROR",
      } as ApiError;
    } else {
      // Lỗi khác
      throw {
        message: error.message || "Có lỗi xảy ra",
        status: 0,
        code: "UNKNOWN_ERROR",
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(
    path: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(path, {
        params,
        ...config,
      });
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(path, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * PUT request
   */
  async put<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(path, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(path, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(path, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Upload file với FormData
   */
  async upload<T>(
    path: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(path, formData, {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      });
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Request với custom config
   */
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return this.transformResponse<T>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Get Axios instance để sử dụng trực tiếp nếu cần
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export class để tạo instance riêng nếu cần
export { ApiClient };
