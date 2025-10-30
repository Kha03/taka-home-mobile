import { ContractVM } from "@/types/contracts";
import { Booking } from "../api/services/booking";

export const bookingToContract = (booking: Booking): ContractVM => {
  const property = booking.property;
  const room = booking.room;
  const roomType = room?.roomType;
  const isBoarding = property.type === "BOARDING";

  const price = isBoarding
    ? parseFloat(roomType?.price || "0")
    : property.price || 0;

  const deposit = isBoarding
    ? parseFloat(roomType?.deposit || "0")
    : parseFloat(property.deposit || "0");

  const propertyCode = isBoarding
    ? room?.name || "N/A"
    : (typeof property.unit === "string"
        ? property.unit
        : property.unit?.name) || "N/A";

  const furnishing = isBoarding
    ? roomType?.furnishing || "Chưa có thông tin"
    : property.furnishing || "Chưa có thông tin";

  let contractStatus: ContractVM["status"] = "pending_landlord";

  if (booking.status === "ACTIVE") contractStatus = "active";
  else if (booking.status === "PENDING_LANDLORD")
    contractStatus = "pending_landlord";
  else if (booking.status === "PENDING_SIGNATURE") {
    const backendStatus = booking.contract?.status;
    if (backendStatus === "PENDING_LANDLORD_SIGNATURE")
      contractStatus = "pending_landlord";
    else contractStatus = "pending_signature";
  } else if (booking.status === "AWAITING_DEPOSIT") {
    contractStatus =
      booking.contract?.status === "SIGNED"
        ? "awaiting_deposit"
        : "pending_signature";
  } else if (booking.status === "ESCROW_FUNDED_T")
    contractStatus = "awaiting_landlord_deposit";
  else if (booking.status === "ESCROW_FUNDED_L")
    contractStatus = "awaiting_deposit";
  else if (booking.status === "DUAL_ESCROW_FUNDED") contractStatus = "active";
  else if (booking.status === "READY_FOR_HANDOVER")
    contractStatus = "ready_for_handover";
  else if (["SETTLED", "CANCELLED"].includes(booking.status))
    contractStatus = "expired";

  return {
    id: booking.contract?.contractCode || booking.id,
    bookingId: booking.id,
    type: "Hợp đồng thuê nhà",
    tenant: booking.tenant.fullName,
    landlord: property.landlord.fullName,
    startDate: booking.contract?.startDate || "",
    endDate: booking.contract?.endDate || "",
    address: `${property.address}, ${property.ward}, ${property.province}`,
    propertyCode,
    propertyType: furnishing,
    category: property.type === "APARTMENT" ? "Chung cư" : "Nhà trọ",
    price,
    deposit,
    status: contractStatus,
    contractCode: booking.contract?.contractCode,
    contractId: booking.contract?.id,
    bookingStatus: booking.status,
    contractStatus: booking.contract?.status,
    invoices: [],
  };
};
