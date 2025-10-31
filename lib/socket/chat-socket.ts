/**
 * Socket.IO Client cho Chat Real-time
 * Xử lý kết nối WebSocket và các events real-time
 */

import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../api/config";

// Types matching backend gateway
export interface SocketMessage {
  id: string;
  chatroomId: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

export interface SendMessagePayload {
  chatroomId: string;
  content: string;
  id?: string; // Optional: message ID from database for tracking
}

export interface JoinRoomPayload {
  chatroomId: string;
}

export interface TypingPayload {
  chatroomId: string;
  isTyping: boolean;
}

export interface UserTypingInfo {
  userId: string;
  fullName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface TypingEventData {
  chatroomId: string;
  users: UserTypingInfo[];
}

export type MessageHandler = (message: SocketMessage) => void;
export type TypingHandler = (data: UserTypingInfo) => void;
export type ErrorHandler = (error: Error) => void;
export type ConnectHandler = () => void;

/**
 * Chat Socket Manager
 */
export class ChatSocketManager {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private typingHandlers: Set<TypingHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectHandlers: Set<ConnectHandler> = new Set();
  private disconnectHandlers: Set<ConnectHandler> = new Set();
  private isConnecting = false;

  /**
   * Kết nối đến Socket.IO server với namespace /chat
   */
  async connect(token?: string): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    const socketUrl = API_CONFIG.BASE_URL.replace("/api", "");
    const authToken = token || (await this.getToken());

    // Connect to /chat namespace
    this.socket = io(`${socketUrl}/chat`, {
      auth: {
        token: authToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  /**
   * Lấy token từ AsyncStorage
   */
  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      return token;
    } catch (error) {
      console.error("Failed to get token from AsyncStorage:", error);
      return null;
    }
  }

  /**
   * Setup các event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnecting = false;

      this.connectHandlers.forEach((handler) => handler());
    });

    this.socket.on("disconnect", () => {
      this.isConnecting = false;
      this.disconnectHandlers.forEach((handler) => handler());
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      this.isConnecting = false;
      this.errorHandlers.forEach((handler) => handler(error));
    });

    // Lắng nghe tin nhắn mới
    this.socket.on("new-message", (message: SocketMessage) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    // Room events
    this.socket.on("joined-room", () => {
      // Room joined successfully
    });

    this.socket.on("user-joined-room", () => {
      // User joined room notification
    });

    this.socket.on("user-left-room", () => {
      // User left room notification
    });

    // Typing events
    this.socket.on("user-typing", (data: TypingEventData) => {
      // Backend sends array of typing users, we need to broadcast each user
      if (data.users && data.users.length > 0) {
        data.users.forEach((user) => {
          this.typingHandlers.forEach((handler) => handler(user));
        });
      } else {
        // No users typing - clear all typing indicators for this room
        this.typingHandlers.forEach((handler) =>
          handler({
            userId: "",
            fullName: "",
            isTyping: false,
            timestamp: Date.now(),
          })
        );
      }
    });

    // Online status events
    this.socket.on("user-online", () => {
      // User online notification
    });

    this.socket.on("user-offline", () => {
      // User offline notification
    });

    this.socket.on("online-users", () => {
      // Online users list
    });

    this.socket.on("error", (error: Error) => {
      console.error("Socket error:", error.message);
      this.errorHandlers.forEach((handler) => handler(error));
    });
  }

  /**
   * Join chat room
   */
  joinRoom(chatroomId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("join-room", { chatroomId });
  }

  /**
   * Leave chat room
   */
  leaveRoom(chatroomId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("leave-room", { chatroomId });
  }

  /**
   * Gửi tin nhắn qua WebSocket
   */
  sendMessage(payload: SendMessagePayload): void {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    this.socket.emit("send-message", payload);
  }

  /**
   * Send typing indicator
   */
  sendTyping(chatroomId: string, isTyping: boolean): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("typing", { chatroomId, isTyping });
  }

  /**
   * Get online users
   */
  getOnlineUsers(): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("get-online-users");
  }

  /**
   * Đăng ký handler cho tin nhắn mới
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Đăng ký handler cho typing indicators
   */
  onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  /**
   * Đăng ký handler cho lỗi
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Đăng ký handler cho kết nối
   */
  onConnect(handler: ConnectHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  /**
   * Đăng ký handler cho ngắt kết nối
   */
  onDisconnect(handler: ConnectHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  /**
   * Ngắt kết nối socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Lấy socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const chatSocket = new ChatSocketManager();
