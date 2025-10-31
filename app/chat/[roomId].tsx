/**
 * Chat Room Screen
 * Real-time chat interface with WebSocket support
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { chatService } from "@/lib/api/services/chat";
import { chatSocket, SocketMessage } from "@/lib/socket/chat-socket";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isMine: boolean;
}

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    isConnected,
    joinRoom,
    leaveRoom,
    sendTyping,
    onNewMessage,
    typingUsers,
  } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState<string>("");
  const [propertyTitle, setPropertyTitle] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat history
  useEffect(() => {
    if (!roomId) return;

    loadChatHistory();
  }, [roomId]);

  // Join room when component mounts
  useEffect(() => {
    if (!roomId || !isConnected) return;

    joinRoom(roomId);

    return () => {
      leaveRoom(roomId);
    };
  }, [roomId, isConnected, joinRoom, leaveRoom]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((socketMessage: SocketMessage) => {
      if (socketMessage.chatroomId === roomId) {
        const newMessage = transformSocketMessage(socketMessage);

        // Prevent duplicate messages by checking ID
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return unsubscribe;
  }, [roomId, onNewMessage, user?.id]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);

      // Load chatroom details to get other user's name
      const chatroomResponse = await chatService.getMyChatrooms();
      if (chatroomResponse.code === 200 && chatroomResponse.data) {
        const chatroom = chatroomResponse.data.find((c) => c.id === roomId);
        if (chatroom) {
          const otherUser =
            chatroom.user1.id === user?.id ? chatroom.user2 : chatroom.user1;
          setOtherUserName(otherUser.fullName || "Người dùng");
          setPropertyTitle(chatroom.property?.title || "");
        }
      }

      // Load messages
      const response = await chatService.getChatroomMessages(roomId);
      if (response.code === 200 && response.data) {
        const transformedMessages = response.data.map(transformChatMessage);
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast.error("Không thể tải lịch sử chat");
    } finally {
      setLoading(false);
    }
  };

  const transformChatMessage = (apiMessage: any): Message => ({
    id: apiMessage.id,
    content: apiMessage.content,
    senderId: apiMessage.sender.id,
    senderName: apiMessage.sender.fullName,
    createdAt: apiMessage.createdAt,
    isMine: apiMessage.sender.id === user?.id,
  });

  const transformSocketMessage = (socketMessage: SocketMessage): Message => ({
    id: socketMessage.id,
    content: socketMessage.content,
    senderId: socketMessage.sender.id,
    senderName: socketMessage.sender.fullName,
    createdAt: socketMessage.createdAt,
    isMine: socketMessage.sender.id === user?.id,
  });

  const handleSendMessage = async () => {
    const content = inputText.trim();
    if (!content || sending) return;

    try {
      setSending(true);

      // Clear input immediately for better UX
      setInputText("");
      sendTyping(false);

      // Send via HTTP API for persistence
      const response = await chatService.sendMessage(roomId, user!.id, content);

      if (response.code === 201 || response.code === 200) {
        // Broadcast via WebSocket for real-time delivery
        if (response.data) {
          chatSocket.sendMessage({
            chatroomId: roomId,
            content,
            id: response.data.id,
          });
        }
      } else {
        throw new Error(response.message || "Gửi tin nhắn thất bại");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.length > 0) {
      sendTyping(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000) as any;
    } else {
      sendTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {!item.isMine && <Text style={styles.senderName}>{item.senderName}</Text>}
      <View
        style={[
          styles.messageBubble,
          item.isMine ? styles.myMessageBubble : styles.theirMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isMine ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            item.isMine ? styles.myMessageTime : styles.theirMessageTime,
          ]}
        >
          {formatMessageTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUsersList = Array.from(typingUsers.values());
    const names = typingUsersList.map((u) => u.fullName).join(", ");

    return (
      <View style={styles.typingIndicator}>
        <Text style={styles.typingText}>{names} đang nhập...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            title: "Đang tải...",
            headerShown: true,
            headerStyle: { backgroundColor: "#fba31d" },
            headerTintColor: "#ffffff",
          }}
        />
        <ActivityIndicator size="large" color="#fba31d" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: otherUserName || "Chat",
          headerShown: true,
          headerStyle: { backgroundColor: "#fba31d" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />

      {/* Property Title Header */}
      {propertyTitle && (
        <View style={styles.propertyTitleBar}>
          <Ionicons name="home-outline" size={16} color="#6b7280" />
          <Text style={styles.propertyTitleText} numberOfLines={1}>
            {propertyTitle}
          </Text>
        </View>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="warning-outline" size={16} color="#ffffff" />
          <Text style={styles.connectionText}>Đang kết nối lại...</Text>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
            <Text style={styles.emptySubtext}>
              Hãy bắt đầu cuộc trò chuyện!
            </Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {renderTypingIndicator()}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <Pressable
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={20} color="#ffffff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 8,
    gap: 8,
  },
  connectionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  propertyTitleBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 8,
  },
  propertyTitleText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: "#fba31d",
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#ffffff",
  },
  theirMessageText: {
    color: "#1f2937",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  theirMessageTime: {
    color: "#9ca3af",
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fba31d",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
});
