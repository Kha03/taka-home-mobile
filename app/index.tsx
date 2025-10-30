import { useAuth } from "@/contexts/auth-context";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/(auth)/signin" />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
