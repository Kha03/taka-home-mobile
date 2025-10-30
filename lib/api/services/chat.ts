/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Chat API Service
 * Xử lý tất cả các API calls liên quan đến chat
 */

import { apiClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * API Response Types
 */

export interface ChatUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  isVerified?: boolean;
  avatarUrl?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  province: string;
  ward: string;
  address: string;
  block: string | null;
  furnishing: string;
  legalDoc: string;
  price: number;
  deposit: number;
  electricityPricePerKwh: number | null;
  waterPricePerM3: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  mapLocation: string | null;
  isVisible: boolean;
  isApproved: boolean;
  heroImage: string | null;
  images: string[] | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatroom: any;
  sender: ChatUser;
  content: string;
  createdAt: string;
}

export interface Chatroom {
  id: string;
  user1: ChatUser;
  user2: ChatUser;
  property: ChatProperty;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageDto {
  content: string;
}

/**
 * Chat Service Class
 */
export class ChatService {
  /**
   * Bắt đầu chat về một property
   * POST /chatrooms/property/:propertyId
   */
  async startChatForProperty(
    propertyId: string
  ): Promise<ApiResponse<Chatroom>> {
    return apiClient.post<Chatroom>(`/chatrooms/property/${propertyId}`);
  }

  /**
   * Lấy danh sách tất cả các chat của user hiện tại
   * GET /chatrooms/my-chats
   */
  async getMyChatrooms(): Promise<ApiResponse<Chatroom[]>> {
    return apiClient.get<Chatroom[]>("/chatrooms/my-chats");
  }

  /**
   * Lấy lịch sử tin nhắn của một chatroom
   * GET /chatmessages/chatroom/:chatroomId
   */
  async getChatroomMessages(
    chatroomId: string
  ): Promise<ApiResponse<ChatMessage[]>> {
    return apiClient.get<ChatMessage[]>(`/chatmessages/chatroom/${chatroomId}`);
  }

  /**
   * Gửi tin nhắn (thông qua HTTP, không phải WebSocket)
   * Sử dụng khi cần gửi tin nhắn thông thường
   */
  async sendMessage(
    chatroomId: string,
    senderId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ChatMessage>(`/chatmessages`, {
      content,
      senderId,
      chatroomId,
    });
  }
}

// Export singleton instance
export const chatService = new ChatService();
