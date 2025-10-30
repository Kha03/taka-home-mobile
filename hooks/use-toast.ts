import Toast from "react-native-toast-message";
import { Alert } from "react-native";

export const toast = {
  success: (message: string, description?: string) => {
    Toast.show({
      type: "success",
      text1: message,
      text2: description,
      visibilityTime: 4000,
    });
  },
  error: (message: string, description?: string) => {
    Toast.show({
      type: "error",
      text1: message,
      text2: description,
      visibilityTime: 5000,
    });
  },
  warning: (message: string, description?: string) => {
    Toast.show({
      type: "info", // react-native-toast-message doesn't have warning, use info
      text1: message,
      text2: description,
      visibilityTime: 4000,
    });
  },
  info: (message: string, description?: string) => {
    Toast.show({
      type: "info",
      text1: message,
      text2: description,
      visibilityTime: 4000,
    });
  },
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    // Show loading toast
    Toast.show({
      type: "info",
      text1: loading,
      visibilityTime: 0, // Don't auto hide
    });

    return promise
      .then((data) => {
        Toast.hide();
        const successMsg =
          typeof success === "function" ? success(data) : success;
        Toast.show({
          type: "success",
          text1: successMsg,
          visibilityTime: 4000,
        });
        return data;
      })
      .catch((err) => {
        Toast.hide();
        const errorMsg = typeof error === "function" ? error(err) : error;
        Toast.show({
          type: "error",
          text1: errorMsg,
          visibilityTime: 5000,
        });
        throw err;
      });
  },
  confirm: (
    message: string,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    // For confirm dialogs, still use Alert as Toast doesn't support interactive buttons
    Alert.alert(message, description, [
      {
        text: "Hủy",
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: "Xác nhận",
        onPress: onConfirm,
      },
    ]);
  },
};

export { toast as useToast };
