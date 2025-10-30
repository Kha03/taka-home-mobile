/**
 * API Index File - Export tất cả API services, hooks và types
 * Điểm entry chính để import các chức năng API
 */

// ========== API Client & Config ==========
export { apiClient, ApiClient } from "./client";
export { API_CONFIG, getApiBaseUrl } from "./config";

// ========== Types ==========
export type * from "./types";

// ========== Services ==========
export { authService, AuthService } from "./services/auth";
export { propertyService, PropertyService } from "./services/property";
export {
  vietnamAddressService,
  VietnamAddressService,
} from "./services/vietnam-address";
export { bookingService, BookingService } from "./services/booking";
export { contractService, ContractService } from "./services/contract";

/**
 * Helper function để handle API errors một cách consistent
 */
export function handleApiError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Có lỗi xảy ra";
}

/**
 * Helper function để format API response cho easy debugging
 */
export function formatApiResponse<T>(response: unknown): {
  success: boolean;
  data: T | null;
  message: string;
} {
  const apiResponse = response as {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
  };
  return {
    success: apiResponse?.success || false,
    data: apiResponse?.data || null,
    message: apiResponse?.message || apiResponse?.error || "Unknown error",
  };
}

/**
 * Helper function để build query params
 */
export function buildQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * Helper function để validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): { isValid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File quá lớn. Kích thước tối đa là ${(
        maxSize /
        1024 /
        1024
      ).toFixed(1)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * Helper function để format currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Helper function để format area (m²)
 */
export function formatArea(area: number): string {
  return `${area} m²`;
}

/**
 * Helper function để debounce API calls
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Legacy constants - use API_CONFIG from config.ts instead
 */
export const LEGACY_CONFIG = {
  BASE_URL: "/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  CACHE_TIME: {
    SHORT: 2 * 60 * 1000, // 2 minutes
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 15 * 60 * 1000, // 15 minutes
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ALLOWED_DOCUMENT_TYPES: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    MAX_FILES_PER_UPLOAD: 8,
  },
} as const;

/**
 * Query key factories cho consistent caching
 */
export const queryKeys = {
  // Properties
  properties: {
    all: ["properties"] as const,
    lists: () => [...queryKeys.properties.all, "list"] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.properties.lists(), params] as const,
    details: () => [...queryKeys.properties.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
    my: () => [...queryKeys.properties.all, "my"] as const,
    similar: (id: string) =>
      [...queryKeys.properties.all, "similar", id] as const,
  },

  // Address
  address: {
    all: ["address"] as const,
    provinces: () => [...queryKeys.address.all, "provinces"] as const,
    districts: (provinceCode: string) =>
      [...queryKeys.address.all, "districts", provinceCode] as const,
    wards: (districtCode: string) =>
      [...queryKeys.address.all, "wards", districtCode] as const,
  },

  // Auth
  auth: {
    user: () => ["auth", "user"] as const,
  },

  // Chat
  chat: {
    all: ["chat"] as const,
    lists: () => [...queryKeys.chat.all, "list"] as const,
    detail: (id: string) => [...queryKeys.chat.all, "detail", id] as const,
    messages: (chatId: string) =>
      [...queryKeys.chat.all, "messages", chatId] as const,
  },

  // Contracts
  contracts: {
    all: ["contracts"] as const,
    lists: () => [...queryKeys.contracts.all, "list"] as const,
    detail: (id: string) => [...queryKeys.contracts.all, "detail", id] as const,
    byProperty: (propertyId: string) =>
      [...queryKeys.contracts.all, "property", propertyId] as const,
  },

  // Rental Requests
  rentalRequests: {
    all: ["rental-requests"] as const,
    lists: () => [...queryKeys.rentalRequests.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.rentalRequests.all, "detail", id] as const,
    sent: () => [...queryKeys.rentalRequests.all, "sent"] as const,
    received: () => [...queryKeys.rentalRequests.all, "received"] as const,
  },
} as const;
