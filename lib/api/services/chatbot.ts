/**
 * Chatbot API Service
 * Xử lý các request liên quan đến chatbot
 */

import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface ChatbotMessageRequest {
  message: string;
}

export interface ChatbotMessageResponse {
  response: string;
}

/**
 * Gửi tin nhắn tới chatbot
 */
export async function sendChatbotMessage(
  message: string
): Promise<ApiResponse<ChatbotMessageResponse>> {
  return apiClient.post<ChatbotMessageResponse>("/chatbot/message", {
    message,
  });
}

export const chatbotService = {
  sendMessage: sendChatbotMessage,
};
