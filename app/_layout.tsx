import { AuthProvider } from "@/contexts/auth-context";
import { ChatProvider } from "@/contexts/chat-context";
import { ThemeProvider } from "@/lib/theme";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { CustomToast } from "@/components/ui/CustomToast";
import { AuthGuard } from "../components/auth/AuthGuard";

const toastConfig = {
  success: (props: any) => <CustomToast {...props} type="success" />,
  error: (props: any) => <CustomToast {...props} type="error" />,
  info: (props: any) => <CustomToast {...props} type="info" />,
  warning: (props: any) => <CustomToast {...props} type="warning" />,
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="properties"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="chat" options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
          <Toast config={toastConfig} />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
