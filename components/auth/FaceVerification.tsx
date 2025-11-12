import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "expo-router";

type CaptureStep = "face" | "cccd" | "done";

export default function FaceVerification() {
  const [step, setStep] = useState<CaptureStep>("face");
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [faceImageUri, setFaceImageUri] = useState<string | null>(null);
  const [cccdImageUri, setCccdImageUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { refreshUserData } = useAuth();
  const router = useRouter();

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#999" />
        <Text style={styles.permissionText}>
          Cần quyền truy cập camera để xác thực
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Cho phép Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (step === "face") {
        setFaceImageUri(photo.uri);
        setStep("cccd");
        setFacing("back"); // Switch to back camera for CCCD
      } else if (step === "cccd") {
        setCccdImageUri(photo.uri);
        setStep("done");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = (type: "face" | "cccd") => {
    if (type === "face") {
      setFaceImageUri(null);
      setStep("face");
      setFacing("front");
    } else {
      setCccdImageUri(null);
      setStep("cccd");
      setFacing("back");
    }
  };

  const handleSubmit = async () => {
    if (!faceImageUri || !cccdImageUri) {
      Alert.alert("Lỗi", "Vui lòng chụp cả hai ảnh");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authService.verifyFaceWithCCCD(
        faceImageUri,
        cccdImageUri
      );

      if (response.code === 200 && response.data) {
        const { isMatch, similarity, isBothImgIDCard, cccdInfo } =
          response.data;

        if (!isBothImgIDCard) {
          Alert.alert(
            "Lỗi xác thực",
            "Ảnh CCCD không hợp lệ. Vui lòng chụp lại ảnh CCCD rõ ràng."
          );
          handleRetake("cccd");
          return;
        }

        if (!isMatch || similarity < 0.7) {
          Alert.alert(
            "Xác thực không thành công",
            `Khuôn mặt không khớp với CCCD (độ tương đồng: ${(
              similarity * 100
            ).toFixed(1)}%). Vui lòng thử lại.`,
            [
              {
                text: "Chụp lại",
                onPress: () => {
                  setFaceImageUri(null);
                  setCccdImageUri(null);
                  setStep("face");
                  setFacing("front");
                },
              },
            ]
          );
          return;
        }

        // Success - refresh user data from server
        await refreshUserData();

        Alert.alert(
          "Xác thực thành công! ✓",
          `Chào ${cccdInfo.name}!\n\nThông tin CCCD đã được cập nhật:\n• Số CCCD: ${cccdInfo.id}\n• Ngày sinh: ${cccdInfo.dob}\n• Quê quán: ${cccdInfo.home}`,
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Xác thực thất bại. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Verification error:", error);

      const errorMessage = (error as any)?.message || "Không thể xác thực";
      const errorCode = (error as any)?.code || "UNKNOWN";

      let userMessage = "Không thể xác thực. Vui lòng thử lại.";

      if (errorCode === "NETWORK_ERROR") {
        userMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else if ((error as any)?.status === 400) {
        userMessage = `Yêu cầu không hợp lệ: ${errorMessage}`;
      } else if ((error as any)?.status === 500) {
        userMessage = `Lỗi server: ${errorMessage}`;
      }

      Alert.alert("Lỗi xác thực", userMessage, [
        {
          text: "Đóng",
          style: "cancel",
        },
        {
          text: "Thử lại",
          onPress: () => {
            setFaceImageUri(null);
            setCccdImageUri(null);
            setStep("face");
            setFacing("front");
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInstructions = () => {
    switch (step) {
      case "face":
        return "Đặt khuôn mặt vào khung hình\nĐảm bảo ánh sáng đầy đủ";
      case "cccd":
        return "Đặt CCCD vào khung hình\nĐảm bảo các thông tin rõ ràng";
      case "done":
        return "Đã chụp xong cả hai ảnh";
    }
  };

  if (step === "done") {
    return (
      <View style={styles.reviewContainer}>
        <Text style={styles.reviewTitle}>Xem lại ảnh đã chụp</Text>

        <View style={styles.imagePreviewContainer}>
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>Ảnh khuôn mặt</Text>
            <Image
              source={{ uri: faceImageUri! }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => handleRetake("face")}
            >
              <Text style={styles.retakeButtonText}>Chụp lại</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>Ảnh CCCD</Text>
            <Image
              source={{ uri: cccdImageUri! }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => handleRetake("cccd")}
            >
              <Text style={styles.retakeButtonText}>Chụp lại</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Xác thực</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.stepText}>
              Bước {step === "face" ? "1" : "2"}/2
            </Text>
            <Text style={styles.instructionText}>{getInstructions()}</Text>
          </View>

          <View style={styles.frameContainer}>
            <View
              style={[
                styles.frame,
                step === "face" ? styles.faceFrame : styles.cccdFrame,
              ]}
            />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePicture}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    color: "#333",
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  stepText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  faceFrame: {
    width: 250,
    height: 320,
    borderRadius: 125,
  },
  cccdFrame: {
    width: 320,
    height: 200,
    borderRadius: 20,
  },
  controls: {
    paddingBottom: 40,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
  reviewContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 40,
  },
  imagePreviewContainer: {
    flex: 1,
    gap: 20,
  },
  previewItem: {
    flex: 1,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  previewImage: {
    width: "100%",
    height: "80%",
    borderRadius: 10,
    resizeMode: "contain",
  },
  retakeButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  retakeButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
