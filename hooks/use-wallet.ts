/**
 * Hook cho việc quản lý thông tin ví
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  paymentService,
  type WalletResponse,
} from "@/lib/api/services/payment";

export interface UseWalletOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseWalletReturn {
  wallet: WalletResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  formatBalance: (balance: number) => string;
}

export function useWallet(options: UseWalletOptions = {}): UseWalletReturn {
  const { autoRefresh = false, refreshInterval = 60000 } = options; // 1 phút

  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet info
  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getWalletMe();
      if (response.code === 200 && response.data) {
        setWallet(response.data);
      } else {
        throw new Error(response.message || "Không thể tải thông tin ví");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải thông tin ví"
      );
      console.error("Error fetching wallet:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Format balance with currency
  const formatBalance = useCallback((balance: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWallet();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchWallet]);

  return {
    wallet,
    loading,
    error,
    refetch: fetchWallet,
    formatBalance,
  };
}
