import { authService, User } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: "TENANT" | "LANDLORD"
  ) => Promise<{ success: boolean; error?: string }>;
  setAuthFromToken: (
    token: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("accessToken");
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
          // Cookie cho middleware
          document.cookie = `accessToken=${token}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
        }
      } catch {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("accessToken");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const afterAuthRedirect = () => {
    // lấy ?from=... trên URL hiện tại nếu có
    router.replace("/(tabs)/");
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await authService.login({ email, password });

      if (response.code === 200 && response.data) {
        const { accessToken, account } = response.data;

        // Transform API user to local User format
        const user: User = {
          id: account.user.id,
          email: account.email,
          fullName: account.user.fullName,
          avatarUrl: account.user.avatarUrl || "/assets/imgs/avatar.png",
          status: account.user.status,
          CCCD: account.user.CCCD || "",
          roles: account.roles || [],
        };

        // Store token and user data
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;

        setUser(user);
        afterAuthRedirect();
        return { success: true };
      }

      return {
        success: false,
        error: response.message || "Email hoặc mật khẩu không đúng",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role: "TENANT" | "LANDLORD" = "TENANT"
  ) => {
    try {
      setIsLoading(true);

      // Call register API
      const response = await authService.register({
        email,
        password,
        fullName: name,
        phone,
        roles: role, // Send role as string, not array
      });

      if (response.code === 200) {
        // After successful registration, automatically login
        const loginResponse = await authService.login({ email, password });

        if (loginResponse.code === 200 && loginResponse.data) {
          const { accessToken, account } = loginResponse.data;

          // Transform API user to local User format
          const user: User = {
            id: account.user.id,
            email: account.email,
            fullName: account.user.fullName,
            avatarUrl: account.user.avatarUrl || "/assets/imgs/avatar.png",
            status: account.user.status,
            roles: account.roles || [],
          };

          // Store token and user data
          await AsyncStorage.setItem("user", JSON.stringify(user));
          await AsyncStorage.setItem("accessToken", accessToken);
          document.cookie = `accessToken=${accessToken}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;

          setUser(user);
          afterAuthRedirect();
          return { success: true };
        }
      }

      return {
        success: false,
        error: response.message || "Đăng ký thất bại. Vui lòng thử lại.",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if available
      await authService.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage and state
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("accessToken");
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      setUser(null);
      router.replace("/(auth)/signin");
    }
  };

  const setAuthFromToken = async (token: string) => {
    try {
      // Không set loading = true để tránh ảnh hưởng UI khác

      // Decode JWT token to get user info
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));

      // Create user object from token payload
      const user: User = {
        id: tokenPayload.sub,
        email: tokenPayload.email,
        fullName:
          tokenPayload.fullName || tokenPayload.name || tokenPayload.email,
        avatarUrl: tokenPayload.picture || "/assets/imgs/avatar.png",
        status: "ACTIVE",
        CCCD: "",
        roles: tokenPayload.roles || [], // Lấy roles từ token
      };

      // Store token and user data (using same keys as normal login)
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("accessToken", token); // For compatibility
      document.cookie = `accessToken=${token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`;

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Set auth from token error:", error);
      return {
        success: false,
        error: "Không thể xử lý token xác thực",
      };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    setAuthFromToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
