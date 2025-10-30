/**
 * Vietnam Address API Service với Axios
 * Tích hợp với API bên thứ ba để lấy dữ liệu tỉnh thành, phường xã Việt Nam
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import type { Province, Ward } from "../types";

export class VietnamAddressService {
  private axiosInstance: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_ADDRESS || "";
    if (!baseURL) {
      console.warn("NEXT_PUBLIC_API_ADDRESS is not configured");
    }

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000, // 15 seconds cho địa chỉ API
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup interceptors cho Vietnam Address API
   */
  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `🌍 Address API Request: ${config.method?.toUpperCase()} ${
            config.url
          }`
        );
        return config;
      },
      (error) => {
        console.error("❌ Address API Request Error:", error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ Address API Response: ${response.status}`, {
          url: response.config.url,
          dataLength: Array.isArray(response.data)
            ? response.data.length
            : "not array",
        });
        return response;
      },
      (error: AxiosError) => {
        console.error(
          `❌ Address API Error: ${error.response?.status}`,
          error.response?.data
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle Axios errors cho Address API
   */
  private handleError(error: AxiosError, operation: string): never {
    if (error.response) {
      throw new Error(
        `${operation} thất bại: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error(`Không thể kết nối đến API địa chỉ cho ${operation}`);
    } else {
      throw new Error(`Lỗi ${operation}: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả các tỉnh thành
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await this.axiosInstance.get<Province[]>("/p");
      return response.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      this.handleError(error as AxiosError, "lấy danh sách tỉnh thành");
    }
  }

  /**
   * Lấy danh sách phường xã theo mã tỉnh
   */
  async getWardsByProvinceCode(provinceCode: number): Promise<Ward[]> {
    try {
      const response = await this.axiosInstance.get<Province>(
        `/p/${provinceCode}`,
        {
          params: { depth: 2 },
        }
      );
      return response.data.wards || [];
    } catch (error) {
      console.error("Error fetching wards:", error);
      this.handleError(error as AxiosError, "lấy danh sách phường xã");
    }
  }
}

// Singleton instance
export const vietnamAddressService = new VietnamAddressService();
