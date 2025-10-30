import { useState, useEffect, useCallback } from "react";
import { bookingService, invoiceService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { bookingToContract } from "@/lib/contracts/mappers";
import type { ContractVM } from "@/types/contracts";

export function useContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get all bookings
      const response = await bookingService.getMyBookings();

      if (response.code === 200 && response.data) {
        // Filter bookings that have contracts or are pending
        const relevantBookings = response.data.filter(
          (booking: any) =>
            booking.contract ||
            booking.status === "PENDING_LANDLORD" ||
            booking.status === "PENDING_SIGNATURE" ||
            booking.status === "AWAITING_DEPOSIT"
        );

        // Map bookings to ContractVM
        const mappedContracts = relevantBookings.map((booking: any) =>
          bookingToContract(booking)
        );

        // Batch fetch invoices for active contracts
        const activeContractIds = mappedContracts
          .filter((c) => c.status === "active" && c.contractId)
          .map((c) => c.contractId!);

        const invoicesMap = new Map();

        await Promise.all(
          activeContractIds.map(async (contractId) => {
            try {
              const invoiceResponse =
                await invoiceService.getInvoiceByContractId(contractId);
              if (invoiceResponse.code === 200 && invoiceResponse.data) {
                invoicesMap.set(contractId, invoiceResponse.data);
              }
            } catch (err) {
              console.error(
                `Failed to fetch invoices for contract ${contractId}:`,
                err
              );
            }
          })
        );

        // Attach invoices to contracts
        const contractsWithInvoices = mappedContracts.map((contract) => ({
          ...contract,
          invoices: invoicesMap.get(contract.contractId) || [],
        }));

        setContracts(contractsWithInvoices);
      } else {
        setError(response.message || "Không thể tải danh sách hợp đồng");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải hợp đồng"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const refresh = useCallback(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    refresh,
    userRole: user?.roles?.[0] || "TENANT",
  };
}
