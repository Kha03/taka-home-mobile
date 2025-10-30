import {
  ContractExtension,
  ContractExtensionRequest,
  BlockchainContractHistoryResponse,
  BlockchainPaymentHistoryResponse,
  PaymentStatus,
} from "@/types/contracts";
import { apiClient } from "../client";
import { ApiResponse } from "../types";
import { signingOption } from "./booking";

export interface EscrowBalanceResponse {
  balanceTenant: string;
  balanceLandlord: string;
  accountId: string;
}

export interface ExtensionFileUrl {
  extensionId: string;
  fileUrl: string;
  createdAt: string;
}

export interface ContractFileUrlResponse {
  fileUrl: string;
  extensionFileUrls: ExtensionFileUrl[];
}

export class ContractService {
  private basePath = "/contracts";
  async getFileUrl(id: string): Promise<ApiResponse<ContractFileUrlResponse>> {
    return apiClient.get<ContractFileUrlResponse>(
      `${this.basePath}/${id}/file-url`
    );
  }

  //lấy thông tin số dư cọc theo hợp đồng
  async getEscrowByContractId(
    contractId: string
  ): Promise<ApiResponse<EscrowBalanceResponse>> {
    return apiClient.get<EscrowBalanceResponse>(`/escrow/balance`, {
      contractId,
    });
  }
  // flow gia hạn hợp đồng
  // gửi yêu cầu gia hạn hợp đồng
  async extendContractRequest(
    contractExtensionRequest: ContractExtensionRequest
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${this.basePath}/extensions`,
      contractExtensionRequest
    );
  }
  //lấy danh sách yêu cầu gia hạn hợp đồng theo id hợp đồng
  async getContractExtensionRequestsByContractId(
    contractId: string
  ): Promise<ApiResponse<ContractExtension[]>> {
    return apiClient.get<ContractExtension[]>(
      `${this.basePath}/${contractId}/extensions`
    );
  }
  //Phản hồi yêu cầu gia hạn hợp đồng (dành cho chủ nhà)
  async respondToContractExtensionRequest(
    extensionId: string,
    {
      status,
      responseNote,
      newMonthlyRent,
    }: {
      status: "LANDLORD_RESPONDED";
      responseNote: string;
      newMonthlyRent: number | null;
    }
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(
      `${this.basePath}/extensions/${extensionId}/respond`,
      {
        status,
        responseNote,
        newMonthlyRent,
      }
    );
  }
  // người thuê đồng ý điều kiện gia hạn hợp đồng
  async tenantDecisionOnExtension(
    extensionId: string,
    status: "AWAITING_SIGNATURES"
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(
      `${this.basePath}/extensions/${extensionId}/tenant-respond`,
      {
        status,
      }
    );
  }
  //người thuê từ chối điều kiện gia hạn hợp đồng
  async tenantRejectionOnExtension(
    extensionId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(
      `${this.basePath}/extensions/${extensionId}/cancel`
    );
  }
  // Chủ nhà ký hợp đồng gia hạn
  async landlordSignExtension(
    extensionId: string,
    signingOption: signingOption
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(
      `${this.basePath}/extensions/${extensionId}/landlord-sign`,
      { signingOption }
    );
  }
  // Người thuê ký hợp đồng gia hạn
  async tenantSignExtension(
    extensionId: string,
    signingOption: signingOption
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(
      `${this.basePath}/extensions/${extensionId}/tenant-sign`,
      { signingOption }
    );
  }

  // Lấy lịch sử blockchain của hợp đồng
  async getContractBlockchainHistory(
    contractId: string,
    orgName: string
  ): Promise<ApiResponse<BlockchainContractHistoryResponse>> {
    return apiClient.get<BlockchainContractHistoryResponse>(
      `/api/blockchain/contracts/${contractId}/history`,
      undefined,
      {
        headers: {
          orgName: orgName,
        },
      }
    );
  }

  // Lấy lịch sử thanh toán trên blockchain
  async getPaymentBlockchainHistory(
    orgName: string,
    status?: PaymentStatus
  ): Promise<ApiResponse<BlockchainPaymentHistoryResponse>> {
    const params = status ? { status } : undefined;
    return apiClient.get<BlockchainPaymentHistoryResponse>(
      `/api/blockchain/payments`,
      params,
      {
        headers: {
          orgName: orgName,
        },
      }
    );
  }
}
export const contractService = new ContractService();
