/**
 * API Configuration
 * Quản lý URLs và settings cho các môi trường khác nhau
 */

/**
 * Get API base URL based on environment
 */
export function getApiBaseUrl(): string {
  // Expo automatically loads EXPO_PUBLIC_* variables from .env file
  // Available as process.env.EXPO_PUBLIC_*
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    console.warn("⚠️ EXPO_PUBLIC_API_BASE_URL not configured in .env file");
    return "http://10.0.2.2:3000/api"; // Fallback for Android emulator
  }

  console.log("✅ API Base URL:", apiUrl);
  return apiUrl;
}

/**
 * API Configuration constants
 */
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,

  // Cache times
  CACHE_TIME: {
    SHORT: 2 * 60 * 1000, // 2 minutes
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 15 * 60 * 1000, // 15 minutes
  },

  // Upload settings
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
 * Environment detection
 */
export const ENV = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;
