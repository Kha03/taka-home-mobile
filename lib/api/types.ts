/**
 * API Types cho Taka Home
 * Định nghĩa các interface và type cho API responses
 */

// ========== Standard API Response Format ==========
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ========== Address Types (Vietnam API) ==========
export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards?: Ward[];
}

export interface Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

export interface AddressData {
  provinces: Province[];
  wards: Ward[];
}

// ========== Property Types ==========

export enum PropertyTypeEnum {
  APARTMENT = "APARTMENT",
  BOARDING = "BOARDING",
}
export interface PropertyRoom {
  id?: string;
  name: string;
  floor: number;
  roomType?: PropertyRoomType; // Nested roomType info from backend
  isVisible?: boolean;
}

export interface PropertyRoomType {
  id?: string; // Added for response from backend after creation
  name: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  deposit?: number;
  furnishing?: string;
  heroImage?: string;
  images?: string[];
  rooms?: PropertyRoom[]; // Rooms nested inside roomTypes
}
export interface LandlordAndTenant {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  isVerified: boolean;
  avatarUrl: string | null;
  status: string;
  CCCD: string | null;
  createdAt: string;
  updatedAt: string;
}
// RoomType Detail Response (for BOARDING detail page)
export interface RoomTypeDetail {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  price: string;
  deposit: string;
  furnishing: string;
  images: string[];
  description: string;
  heroImage: string | null;
  createdAt: string;
  updatedAt: string;
  rooms: Array<{
    id: string;
    name: string;
    property: {
      id: string;
      title: string;
      description: string;
      type: string;
      province: string;
      ward: string;
      address: string;
      block: string | null;
      furnishing: string | null;
      legalDoc: string | null;
      price: string | null;
      deposit: string | null;
      electricityPricePerKwh: string;
      waterPricePerM3: string;
      area: string | null;
      bedrooms: number | null;
      bathrooms: number | null;
      mapLocation: string;
      isVisible: boolean;
      isApproved: boolean;
      heroImage: string | null;
      landlord: LandlordAndTenant;
      images: string[] | null;
      unit: string;
      createdAt: string;
      updatedAt: string;
    };
    isVisible: boolean;
    floor: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface PropertyFloor {
  name: string;
  rooms: string[];
}

export interface Property {
  id: string;
  title: string;
  type: PropertyTypeEnum;

  // Location
  province: string;
  ward: string;
  address: string;
  mapLocation?: string;

  // Apartment specific
  block?: string;
  floor?: number;
  unit?: string;

  // Boarding specific
  floors?: PropertyFloor[];
  rooms?: PropertyRoom[];
  electricityPricePerKwh?: number;
  waterPricePerM3?: number;

  description?: string;
  landlord?: LandlordAndTenant;
  // Details
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  legalDoc?: string;
  area?: number;
  price?: number;
  deposit?: number;

  // Images
  heroImage?: string;
  images?: string[]; // API returns 'images', not 'gallery'
  gallery?: string[]; // Keep for backward compatibility

  // Room types for boarding
  roomTypes?: PropertyRoomType[];

  // Metadata
  isVisible?: boolean;
  isApproved?: boolean;
  status?: "draft" | "pending" | "approved" | "rejected";
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyCreateRequest {
  title: string;
  description?: string;
  type: PropertyTypeEnum;
  province: string;
  ward: string;
  address: string;
  mapLocation?: string;
  electricityPricePerKwh?: number;
  waterPricePerM3?: number;
  isVisible?: boolean;
  legalDoc?: string;
  unit?: string;
  roomTypes?: PropertyRoomType[]; // rooms are now nested inside roomTypes
}

export interface PropertyUpdateRequest extends Partial<PropertyCreateRequest> {
  id: string;
}

// ========== Room Move Types ==========
// Chuyển room sang RoomType có sẵn
export interface MoveRoomToExistingTypeRequest {
  targetRoomTypeId: string;
  createNewRoomType?: false;
}

// Tạo RoomType mới và chuyển Room vào đó
export interface MoveRoomToNewTypeRequest {
  createNewRoomType: true;
  newRoomTypeName: string;
  newRoomTypeDescription?: string;
  newRoomTypeBedrooms: number;
  newRoomTypeBathrooms: number;
  newRoomTypeArea: number;
  newRoomTypePrice: number;
  newRoomTypeDeposit: number;
  newRoomTypeFurnishing: "Đầy đủ" | "Cơ bản" | "Trống";
}

// Union type cho cả 2 trường hợp
export type MoveRoomRequest =
  | MoveRoomToExistingTypeRequest
  | MoveRoomToNewTypeRequest;

export interface FilterPropertyQuery {
  // === khớp tên với FilterPropertyDto ===
  fromPrice?: number; // Giá từ (VND)
  toPrice?: number; // Giá đến (VND)
  bedrooms?: number; // Số phòng ngủ
  bathrooms?: number; // Số phòng tắm
  fromArea?: number; // Diện tích từ (m2)
  toArea?: number; // Diện tích đến (m2)
  furnishing?: string; // 'Đầy đủ' | 'Cơ bản' | 'Không'
  isApproved?: boolean; // true/false
  province?: string; // Tỉnh/thành phố
  ward?: string; // Phường/xã
  type?: PropertyTypeEnum; // Loại BĐS

  // === phần FE thêm để phân trang/sort/search tự do ===
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "price" | "area" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ========== Chat Types ==========
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "file";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  propertyId?: string;
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ChatCreateRequest {
  receiverId: string;
  propertyId?: string;
  initialMessage?: string;
}

export interface MessageSendRequest {
  chatId: string;
  content: string;
  type?: "text" | "image" | "file";
}

// ========== Contract Types ==========
export interface Contract {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  roomTypeId?: string; // For boarding houses

  // Contract terms
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  utilities?: string[];

  // Contract details
  terms: string;
  status: "draft" | "pending" | "active" | "expired" | "terminated";

  // Signatures
  landlordSigned: boolean;
  tenantSigned: boolean;
  landlordSignedAt?: string;
  tenantSignedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ContractCreateRequest {
  propertyId: string;
  tenantId: string;
  roomTypeId?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  utilities?: string[];
  terms: string;
}

export interface ContractUpdateRequest extends Partial<ContractCreateRequest> {
  id: string;
}

// ========== Rental Request Types ==========
export interface RentalRequest {
  id: string;
  propertyId: string;
  requesterId: string;
  roomTypeId?: string; // For boarding houses

  message: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";

  // Requested terms
  desiredMoveInDate: string;
  desiredLeaseDuration: number; // in months

  createdAt: string;
  updatedAt: string;
}

export interface RentalRequestCreateRequest {
  propertyId: string;
  roomTypeId?: string;
  message: string;
  desiredMoveInDate: string;
  desiredLeaseDuration: number;
}

export interface RentalRequestUpdateRequest {
  id: string;
  status: "approved" | "rejected" | "withdrawn";
  responseMessage?: string;
}

// ========== Auth Types ==========
export interface User {
  id: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  phone?: string;
  CCCD?: string;
  roles?: ("TENANT" | "LANDLORD" | "ADMIN")[];
}

export interface Account {
  id: string;
  email: string;
  roles: ("TENANT" | "LANDLORD" | "ADMIN")[];
  isVerified: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  roles?: "TENANT" | "LANDLORD";
}

export interface AuthResponse {
  accessToken: string;
  account: Account;
}

export interface RegisterResponse {
  message: string;
}

// ========== Upload Types ==========
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface MultipleUploadResponse {
  files: UploadResponse[];
}

// ========== Notification Types ==========
export interface NotificationResponse {
  id: string;
  type: "GENERAL" | "PAYMENT" | "CONTRACT" | "PENALTY" | "SYSTEM";
  title: string;
  content: string;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
}

// ========== Statistics Types ==========
export interface LandlordStatistics {
  totalProperties: number;
  totalBooking: number;
  yearsOfParticipation: string;
}
