"use client";

/**
 * Hook cho việc quản lý notifications
 */

import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/lib/api/services";
import type { NotificationResponse } from "@/lib/api/types";

export interface UseNotificationsOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseNotificationsReturn {
  notifications: NotificationResponse[];
  pendingCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  markAllAsCompleted: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { userId, autoRefresh = false, refreshInterval = 30000 } = options;

  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tính toán pendingCount từ danh sách notifications
  const pendingCount = notifications.filter(
    (n) => n.status === "PENDING"
  ).length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.findAllByUserId(userId);
      if (response.code === 200 && response.data) {
        setNotifications(response.data);
      } else {
        throw new Error(response.message || "Không thể tải thông báo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as completed
  const markAsCompleted = useCallback(async (id: string) => {
    try {
      const response = await notificationService.markAsCompleted(id);
      if (response.code === 200) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, status: "COMPLETED" as const }
              : notification
          )
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể đánh dấu đã hoàn thành"
      );
    }
  }, []);

  // Mark all notifications as completed
  const markAllAsCompleted = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await notificationService.markAllAsCompleted(userId);
      if (response.code === 200) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            status: "COMPLETED" as const,
          }))
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đánh dấu tất cả đã hoàn thành"
      );
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.code === 200) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa thông báo");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, fetchNotifications]);

  return {
    notifications,
    pendingCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsCompleted,
    markAllAsCompleted,
    deleteNotification,
  };
}
