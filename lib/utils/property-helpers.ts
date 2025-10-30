/**
 * Property Helper Functions
 * Shared utilities for handling APARTMENT and BOARDING property types
 */

import type { Property } from "@/lib/api/types";

// Define RoomType interface for BOARDING properties
export interface RoomType {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  deposit: number;
  furnishing: string;
  images: string[];
  description: string;
  heroImage: string | null;
  rooms: Array<{
    id: string;
    name: string;
    floor: number;
    isVisible: boolean;
  }>;
  property: {
    id: string;
    title: string;
    province: string;
    ward: string;
    address: string;
    isApproved: boolean;
    landlord: {
      id: string;
      name: string;
    };
  };
}

// Union type for mixed response (Property for APARTMENT, RoomType for BOARDING)
export type PropertyOrRoomType = Property | RoomType;

/**
 * Type guard to check if item is RoomType (BOARDING)
 */
export function isRoomType(item: PropertyOrRoomType): item is RoomType {
  return "property" in item && "rooms" in item && !("type" in item);
}

/**
 * Type guard to check if item is Property (APARTMENT)
 */
export function isProperty(item: PropertyOrRoomType): item is Property {
  return "type" in item && !("property" in item);
}

/**
 * Get property ID from either Property or RoomType
 * For APARTMENT: return property.id
 * For BOARDING: return property.property.id (the parent property)
 */
export function getPropertyId(item: PropertyOrRoomType): string {
  if (isRoomType(item)) {
    return item.property.id;
  }
  return item.id;
}

/**
 * Get room type ID for BOARDING properties
 * Returns the RoomType ID (used for detail page routing)
 */
export function getRoomTypeId(item: PropertyOrRoomType): string | undefined {
  if (isRoomType(item)) {
    return item.id;
  }
  return undefined;
}

/**
 * Get display ID for routing
 * For APARTMENT: return property.id
 * For BOARDING: return roomType.id (for detail page)
 */
export function getDisplayId(item: PropertyOrRoomType): string {
  if (isRoomType(item)) {
    return item.id; // Use roomType ID for boarding detail page
  }
  return item.id;
}

/**
 * Get property type
 */
export function getPropertyType(
  item: PropertyOrRoomType
): "apartment" | "boarding" {
  return isRoomType(item) ? "boarding" : "apartment";
}

/**
 * Get property title
 */
export function getPropertyTitle(item: PropertyOrRoomType): string {
  if (isRoomType(item)) {
    return item.property.title;
  }
  return item.title;
}

/**
 * Get room type name (for BOARDING only)
 */
export function getRoomTypeName(item: PropertyOrRoomType): string | undefined {
  if (isRoomType(item)) {
    return item.name;
  }
  return undefined;
}

/**
 * Get property location
 */
export function getPropertyLocation(item: PropertyOrRoomType): string {
  if (isRoomType(item)) {
    return `${item.property.address}, ${item.property.ward}, ${item.property.province}`;
  }
  return `${item.address}, ${item.ward}, ${item.province}`;
}

/**
 * Get property image URL
 */
export function getPropertyImage(item: PropertyOrRoomType): string {
  const defaultImage = "/assets/imgs/house-item.png";

  if (isRoomType(item)) {
    return item.heroImage || item.images?.[0] || defaultImage;
  }

  return (
    item.heroImage || item.images?.[0] || item.gallery?.[0] || defaultImage
  );
}

/**
 * Get property images array
 */
export function getPropertyImages(item: PropertyOrRoomType): string[] {
  if (isRoomType(item)) {
    const images: string[] = [];
    if (item.heroImage) images.push(item.heroImage);
    if (item.images && item.images.length > 0) images.push(...item.images);
    return images;
  }

  const images: string[] = [];
  if (item.heroImage) images.push(item.heroImage);
  // API returns 'images', fallback to 'gallery' for backward compatibility
  if (item.images && item.images.length > 0) {
    images.push(...item.images);
  } else if (item.gallery && item.gallery.length > 0) {
    images.push(...item.gallery);
  }
  return images;
}

/**
 * Get property details
 */
export function getPropertyDetails(item: PropertyOrRoomType) {
  if (isRoomType(item)) {
    return {
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      area: item.area,
      price: item.price,
      deposit: item.deposit,
      furnishing: item.furnishing,
    };
  }

  return {
    bedrooms: item.bedrooms || 0,
    bathrooms: item.bathrooms || 0,
    area: item.area || 0,
    price: item.price || 0,
    deposit: item.deposit || 0,
    furnishing: item.furnishing || "",
  };
}

/**
 * Get approval status
 */
export function getApprovalStatus(item: PropertyOrRoomType): boolean {
  if (isRoomType(item)) {
    return item.property.isApproved;
  }
  return item.isApproved || false;
}

/**
 * Get updated date
 */
export function getUpdatedDate(item: PropertyOrRoomType): string {
  if (isRoomType(item)) {
    // RoomType doesn't have updatedAt, use current date or empty
    return "";
  }
  return item.updatedAt || "";
}
