export interface ContractInvoice {
  id: number; // Số thứ tự hiển thị
  invoiceId: string; // UUID từ API để thanh toán
  month: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export type ContractStatus =
  | "active"
  | "expired"
  | "pending_signature"
  | "pending_landlord"
  | "awaiting_deposit"
  | "awaiting_landlord_deposit"
  | "ready_for_handover";

export interface ContractVM {
  id: string;
  bookingId: string;
  type: string;
  tenant: string;
  landlord: string;
  startDate: string;
  endDate: string;
  address: string;
  propertyCode: string;
  propertyType: string;
  category: string;
  price: number;
  deposit: number;
  status:
    | "active"
    | "expired"
    | "pending_signature"
    | "pending_landlord"
    | "awaiting_deposit"
    | "awaiting_landlord_deposit"
    | "ready_for_handover";
  contractCode?: string;
  contractId?: string;
  bookingStatus: string;
  contractStatus?: string; // Status của contract từ backend
  invoices: ContractInvoice[];
}
export interface ContractExtensionRequest {
  contractId: string;
  extensionMonths: number;
  requestNote: string;
}

export interface ContractExtension {
  id: string;
  contractId: string;
  extensionMonths: number;
  newMonthlyRent: number | null;
  requestNote: string;
  responseNote: string | null;
  status:
    | "PENDING"
    | "LANDLORD_RESPONDED"
    | "AWAITING_SIGNATURES"
    | "LANDLORD_SIGNED"
    | "AWAITING_ESCROW"
    | "ESCROW_FUNDED_T"
    | "ESCROW_FUNDED_L"
    | "ACTIVE"
    | "REJECTED"
    | "CANCELLED";
  respondedAt: string;
  extensionContractFileUrl: string | null;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  transactionIdLandlordSign: string | null;
  transactionIdTenantSign: string | null;
  escrowDepositDueAt: string | null;
  tenantEscrowDepositFundedAt: string | null;
  landlordEscrowDepositFundedAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Blockchain Contract History Types
export interface ContractPenalty {
  amount: number;
  party: "landlord" | "tenant";
  reason: string;
  recordedBy: string;
  recordedByRole: string;
  timestamp: string;
}

export interface ContractDeposit {
  amount: number;
  depositTxRef: string;
  depositedBy: string;
  expectedDepositor: string;
  depositedAt: string;
}

export interface ContractPayment {
  amount: number;
  paymentTxRef: string;
  paidBy: string;
  expectedPayer: string;
  paidAt: string;
}

export interface SignatureMetadata {
  algorithm: string;
  source: string;
  signatureIndex: number;
  timestamp: string;
  signer: {
    role: "landlord" | "tenant";
    userId: string;
    name: string;
  };
  contract: {
    code: string;
    status: string;
  };
  fileUrl: string;
}

export interface ContractSignature {
  metadata: SignatureMetadata;
  signedBy: string;
  expectedSigner?: string;
  signedAt: string;
  status: "SIGNED" | "PENDING";
}

export interface BlockchainExtension {
  extensionNumber: number;
  previousEndDate: string;
  newEndDate: string;
  previousRentAmount: number;
  newRentAmount: number;
  extensionAgreementHash: string;
  notes: string;
  recordedBy: string;
  recordedByRole: "landlord" | "tenant";
  recordedAt: string;
  status: "ACTIVE" | "PENDING" | "CANCELLED";
}

export interface BlockchainContractValue {
  contractId: string;
  objectType: string;
  landlordId: string;
  tenantId: string;
  landlordMSP: string;
  tenantMSP: string;
  landlordCertId: string;
  tenantCertId: string;
  landlordSignedHash: string;
  fullySignedHash: string | null;
  rentAmount: number;
  depositAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
  signatures: {
    landlord: ContractSignature;
    tenant?: ContractSignature;
  };
  createdBy: string;
  createdByMSP: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  deposit: {
    landlord: ContractDeposit | null;
    tenant: ContractDeposit | null;
  };
  firstPayment: ContractPayment | null;
  penalties: ContractPenalty[];
  currentExtensionNumber: number;
  extensions: BlockchainExtension[];
}

export interface BlockchainContractHistoryItem {
  txId: string;
  timestamp: string;
  isDelete: boolean;
  value: BlockchainContractValue;
}

export interface BlockchainContractHistoryResponse {
  data: BlockchainContractHistoryItem[];
}

// Blockchain Payment History Types
export type PaymentStatus = "OVERDUE" | "PAID" | "SCHEDULED";

export interface PaymentPenalty {
  amount: number;
  appliedAt: string;
  appliedBy: string;
  appliedByRole: string;
  policyRef: string;
  reason: string;
}

export interface BlockchainPaymentValue {
  paymentId: string;
  contractId: string;
  amount: number;
  paidAmount?: number;
  status: PaymentStatus;
  period: number;
  dueDate: string;
  overdueAt?: string;
  paidAt?: string;
  paidBy?: string;
  expectedPayer?: string;
  orderRef?: string;
  objectType: string;
  extensionNumber?: number;
  penalties?: PaymentPenalty[];
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainPaymentHistoryItem {
  txId: string;
  timestamp: string;
  isDelete: boolean;
  value: BlockchainPaymentValue;
}

export interface BlockchainPaymentHistoryResponse {
  data: BlockchainPaymentValue[]; // API trả về array trực tiếp, không có wrapper txId/timestamp
}
