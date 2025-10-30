export interface RentalRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  roomCode?: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  requestDate: string;
  moveInDate: string;
  status: "sent" | "pending" | "approved" | "rejected" | "awaiting-payment";
  notes?: string;
  // Property details for display
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  furnitureStatus: string;
  category: string;
  price: number;
  currency?: string;
  // Additional rental request specific fields
  contractDuration: number; // in months
  deposit: number;
  monthlyRent: number;
  rejectionReason?: string;
}

export type RentalRequestStatus =
  | "all"
  | "sent"
  | "pending"
  | "rejected"
  | "awaiting-payment";

export interface RentalRequestTab {
  id: RentalRequestStatus;
  label: string;
  count: number;
}
