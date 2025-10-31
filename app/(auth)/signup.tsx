import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Input, Button, Text, Icon, CheckBox } from "@rneui/themed";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"TENANT" | "LANDLORD">("TENANT");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
    general: "",
  });
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSignUp = async () => {
    // Reset errors
    setErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: "",
      general: "",
    });

    // Validation
    let hasError = false;
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: "",
      general: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
      hasError = true;
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = "Email không hợp lệ";
      hasError = true;
    }

    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      hasError = true;
    }

    if (!acceptTerms) {
      newErrors.terms = "Bạn phải chấp nhận điều khoản sử dụng";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Call register API
    const result = await register(fullName, email, password, phone, role);
    if (!result.success) {
      setErrors({ ...newErrors, general: result.error || "Đăng ký thất bại" });
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
            Tạo tài khoản mới
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* General Error */}
          {errors.general ? (
            <View style={styles.errorContainer}>
              <Icon
                name="error-outline"
                type="material"
                color="#f44336"
                size={20}
              />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Full Name Input */}
          <Input
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={
              <Icon name="person" type="material" size={24} color="#666" />
            }
            errorMessage={errors.fullName}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />

          {/* Email Input */}
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={
              <Icon name="email" type="material" size={24} color="#666" />
            }
            errorMessage={errors.email}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />

          {/* Phone Input */}
          <Input
            placeholder="Số điện thoại (tùy chọn)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={
              <Icon name="phone" type="material" size={24} color="#666" />
            }
            errorMessage={errors.phone}
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
            leftIcon={
              <Icon name="lock" type="material" size={24} color="#666" />
            }
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "visibility" : "visibility-off"}
                  type="material"
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

          {/* Confirm Password Input */}
          <Input
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            leftIcon={
              <Icon name="lock" type="material" size={24} color="#666" />
            }
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  type="material"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            }
            errorMessage={errors.confirmPassword}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Bạn là:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "TENANT" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("TENANT")}
              >
                <Icon
                  name="person"
                  type="material"
                  size={20}
                  color={role === "TENANT" ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "TENANT" && styles.roleButtonTextActive,
                  ]}
                >
                  Người thuê
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "LANDLORD" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("LANDLORD")}
              >
                <Icon
                  name="home"
                  type="material"
                  size={20}
                  color={role === "LANDLORD" ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "LANDLORD" && styles.roleButtonTextActive,
                  ]}
                >
                  Chủ nhà
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions */}
          <CheckBox
            title={
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>Tôi đồng ý với </Text>
                <TouchableOpacity>
                  <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> và </Text>
                <TouchableOpacity>
                  <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                </TouchableOpacity>
              </View>
            }
            checked={acceptTerms}
            onPress={() => setAcceptTerms(!acceptTerms)}
            containerStyle={styles.checkboxContainer}
            checkedColor="#071658"
          />
          {errors.terms ? (
            <Text style={styles.termsError}>{errors.terms}</Text>
          ) : null}

          {/* Sign Up Button */}
          <Button
            title="Đăng ký"
            onPress={handleSignUp}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={styles.signUpButton}
            titleStyle={styles.signUpButtonText}
            containerStyle={styles.signUpButtonContainer}
            icon={
              <Icon
                name="person-add"
                type="material"
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
              icon={
                <Icon
                  name="google"
                  type="font-awesome"
                  color="#DB4437"
                  size={20}
                />
              }
            />
            <Button
              buttonStyle={styles.socialButton}
              containerStyle={styles.socialButtonContainer}
              icon={
                <Icon
                  name="facebook"
                  type="font-awesome"
                  color="#4267B2"
                  size={20}
                />
              }
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Đã có tài khoản? </Text>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Đăng nhập ngay</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
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
  formContainer: {
    flex: 1,
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
  roleContainer: {
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: "#071658",
    borderColor: "#071658",
  },
  roleButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginBottom: 8,
  },
  termsTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 8,
  },
  termsText: {
    fontSize: 13,
    color: "#666",
  },
  termsLink: {
    fontSize: 13,
    color: "#071658",
    fontWeight: "600",
  },
  termsError: {
    fontSize: 12,
    color: "#f44336",
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 12,
  },
  signUpButtonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButton: {
    backgroundColor: "#071658",
    borderRadius: 8,
    paddingVertical: 14,
  },
  signUpButtonText: {
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
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  signInText: {
    color: "#666",
    fontSize: 14,
  },
  signInLink: {
    color: "#071658",
    fontSize: 14,
    fontWeight: "600",
  },
});
