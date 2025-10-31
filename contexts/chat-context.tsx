/**
 * Chat Context
 * Manages WebSocket connection and chat state
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  chatSocket,
  SocketMessage,
  UserTypingInfo,
} from "@/lib/socket/chat-socket";
import { useAuth } from "./auth-context";

interface ChatContextType {
  isConnected: boolean;
  currentRoomId: string | null;
  typingUsers: Map<string, UserTypingInfo>;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendTyping: (isTyping: boolean) => void;
  onNewMessage: (callback: (message: SocketMessage) => void) => () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, UserTypingInfo>>(
    new Map()
  );

  // Connect to socket when user is authenticated
  useEffect(() => {
    const connectSocket = async () => {
      if (isAuthenticated && user) {
        // Get token from AsyncStorage and connect
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          await chatSocket.connect(token);
        }
      }
    };

    connectSocket();

    return () => {
      if (currentRoomId) {
        chatSocket.leaveRoom(currentRoomId);
      }
    };
  }, [isAuthenticated, user]);

  // Setup connection status handlers
  useEffect(() => {
    const unsubscribeConnect = chatSocket.onConnect(() => setIsConnected(true));
    const unsubscribeDisconnect = chatSocket.onDisconnect(() =>
      setIsConnected(false)
    );
    const unsubscribeError = chatSocket.onError((error) => {
      console.error("Chat WebSocket error:", error.message);
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, []);

  // Setup typing indicator handler
  useEffect(() => {
    const unsubscribe = chatSocket.onTyping((typingInfo: UserTypingInfo) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);

        if (typingInfo.isTyping && typingInfo.userId !== user?.id) {
          newMap.set(typingInfo.userId, typingInfo);
        } else {
          newMap.delete(typingInfo.userId);
        }

        return newMap;
      });
    });

    return unsubscribe;
  }, [user?.id]);

  const joinRoom = useCallback(
    (roomId: string) => {
      if (currentRoomId && currentRoomId !== roomId) {
        chatSocket.leaveRoom(currentRoomId);
      }

      chatSocket.joinRoom(roomId);
      setCurrentRoomId(roomId);
      setTypingUsers(new Map());
    },
    [currentRoomId]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      chatSocket.leaveRoom(roomId);

      if (currentRoomId === roomId) {
        setCurrentRoomId(null);
        setTypingUsers(new Map());
      }
    },
    [currentRoomId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (currentRoomId) {
        chatSocket.sendTyping(currentRoomId, isTyping);
      }
    },
    [currentRoomId]
  );

  const onNewMessage = useCallback(
    (callback: (message: SocketMessage) => void) => {
      return chatSocket.onMessage(callback);
    },
    []
  );

  const value: ChatContextType = {
    isConnected,
    currentRoomId,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendTyping,
    onNewMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
