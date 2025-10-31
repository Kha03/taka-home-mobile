import { useAuth } from "@/contexts/auth-context";
import { Button, Input, Text } from "@rneui/themed";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    // Reset errors
    setErrors({ email: "", password: "", general: "" });

    // Validation
    let hasError = false;
    const newErrors = { email: "", password: "", general: "" };

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = "Email không hợp lệ";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Call login API
    const result = await login(email, password);
    if (!result.success) {
      setErrors({ ...errors, general: result.error || "Đăng nhập thất bại" });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Text h3 style={styles.title}>
            Chào mừng trở lại!
          </Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục sử dụng dịch vụ
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* General Error */}
          {errors.general ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" color="#f44336" size={20} />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<MaterialIcons name="email" size={24} color="#666" />}
            errorMessage={errors.email}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />

          {/* Password Input */}
          <Input
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<MaterialIcons name="lock" size={24} color="#666" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            }
            errorMessage={errors.password}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <Button
            title="Đăng nhập"
            onPress={handleSignIn}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={styles.signInButton}
            titleStyle={styles.signInButtonText}
            containerStyle={styles.signInButtonContainer}
            icon={
              <MaterialIcons
                name="login"
                color="white"
                size={20}
                style={{ marginRight: 8 }}
              />
            }
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <Button
              buttonStyle={styles.socialButton}
              containerStyle={styles.socialButtonContainer}
              icon={<FontAwesome name="google" color="#DB4437" size={20} />}
            />
            <Button
              buttonStyle={styles.socialButton}
              containerStyle={styles.socialButtonContainer}
              icon={<FontAwesome name="facebook" color="#4267B2" size={20} />}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    minHeight: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    color: "#1a1a1a",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  illustrationContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  illustration: {
    width: 200,
    height: 150,
  },
  formContainer: {
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  input: {
    fontSize: 14,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#071658",
    fontSize: 14,
    fontWeight: "600",
  },
  signInButtonContainer: {
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: "#071658",
    borderRadius: 8,
    paddingVertical: 14,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  socialButtonContainer: {
    width: 60,
  },
  socialButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 12,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#071658",
    fontSize: 14,
    fontWeight: "600",
  },
});
