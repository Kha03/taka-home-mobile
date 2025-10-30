import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
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
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
  confirm: (
    message: string,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    sonnerToast(message, {
      description,
      duration: Infinity,
      action: {
        label: "Xác nhận",
        onClick: () => {
          onConfirm();
        },
      },
      cancel: {
        label: "Hủy",
        onClick: () => {
          onCancel?.();
        },
      },
    });
  },
};

export { toast as useToast };
