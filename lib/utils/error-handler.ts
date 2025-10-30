/**
 * Error Handler Utilities
 * Xử lý và format error messages từ API
 */

import type { ApiError } from "@/lib/api/client";

/**
 * Lấy error message từ API error object
 * @param error - Error object từ API
 * @param fallbackMessage - Message mặc định nếu không có message từ API
 * @returns Error message string
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string = "Có lỗi xảy ra. Vui lòng thử lại"
): string {
  if (!error) return fallbackMessage;

  // Nếu là ApiError
  const apiError = error as ApiError;
  if (apiError?.message) {
    return apiError.message;
  }

  // Nếu là Error object thông thường
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return fallbackMessage;
}

/**
 * Kiểm tra xem error có phải là ApiError không
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error
  );
}

/**
 * Lấy status code từ error
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.status;
  }
  return undefined;
}

/**
 * Kiểm tra xem error có phải là lỗi validation không (400)
 */
export function isValidationError(error: unknown): boolean {
  return getErrorStatus(error) === 400;
}

/**
 * Kiểm tra xem error có phải là lỗi unauthorized không (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  return getErrorStatus(error) === 401;
}

/**
 * Kiểm tra xem error có phải là lỗi forbidden không (403)
 */
export function isForbiddenError(error: unknown): boolean {
  return getErrorStatus(error) === 403;
}

/**
 * Kiểm tra xem error có phải là lỗi not found không (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

/**
 * Kiểm tra xem error có phải là lỗi conflict không (409)
 */
export function isConflictError(error: unknown): boolean {
  return getErrorStatus(error) === 409;
}
