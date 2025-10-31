/**
 * Chat List Screen
 * Shows all active conversations
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "@/contexts/chat-context";
import { chatService, Chatroom } from "@/lib/api/services/chat";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isConnected } = useChat();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChatrooms();
  }, []);

  const loadChatrooms = async () => {
    try {
      setLoading(true);
      const response = await chatService.getMyChatrooms();

      if (response.code === 200 && response.data) {
        setChatrooms(response.data);
      }
    } catch (error) {
      console.error("Failed to load chatrooms:", error);
      toast.error("Không thể tải danh sách chat");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChatrooms();
    setRefreshing(false);
  }, []);

  const handleChatroomPress = (chatroomId: string) => {
    router.push(`/chat/${chatroomId}`);
  };

  const getOtherUser = (chatroom: Chatroom) => {
    return chatroom.user1.id === user?.id ? chatroom.user2 : chatroom.user1;
  };

  const getLastMessage = (chatroom: Chatroom): string => {
    if (!chatroom.messages || chatroom.messages.length === 0) {
      return "Chưa có tin nhắn";
    }
    const lastMsg = chatroom.messages[chatroom.messages.length - 1];
    return lastMsg.content;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}p`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const renderChatroom = ({ item }: { item: Chatroom }) => {
    const otherUser = getOtherUser(item);
    const lastMessage = getLastMessage(item);
    const lastMessageTime =
      item.messages?.[item.messages.length - 1]?.createdAt || item.updatedAt;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatroomItem,
          pressed && styles.chatroomItemPressed,
        ]}
        onPress={() => handleChatroomPress(item.id)}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherUser.avatarUrl ? (
            <Image
              source={{ uri: otherUser.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.chatroomContent}>
          <View style={styles.chatroomHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUser.fullName || "Người dùng"}
            </Text>
            <Text style={styles.timeText}>{formatTime(lastMessageTime)}</Text>
          </View>

          <View style={styles.chatroomBody}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {item.property.title}
            </Text>
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Tin nhắn",
            headerShown: true,
            headerStyle: { backgroundColor: "#fba31d" },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "600", fontSize: 18 },
          }}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fba31d" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Tin nhắn",
          headerShown: true,
          headerStyle: { backgroundColor: "#fba31d" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600", fontSize: 18 },
          headerRight: () => (
            <Pressable style={styles.headerButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={24} color="#ffffff" />
            </Pressable>
          ),
        }}
      />

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="warning-outline" size={16} color="#ffffff" />
          <Text style={styles.connectionText}>Đang kết nối lại...</Text>
        </View>
      )}

      <FlatList
        data={chatrooms}
        renderItem={renderChatroom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={chatrooms.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#fba31d"]}
            tintColor="#fba31d"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
            <Text style={styles.emptySubtitle}>
              Bắt đầu chat khi bạn liên hệ về một bất động sản
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
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
  chatroomItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  chatroomItemPressed: {
    backgroundColor: "#f9fafb",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  chatroomContent: {
    flex: 1,
    marginRight: 8,
  },
  chatroomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  chatroomBody: {
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 13,
    color: "#fba31d",
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
});
