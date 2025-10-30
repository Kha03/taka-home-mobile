"use client";

import { useState } from "react";

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    fileName: string;
    originalName: string;
    size: number;
    type: string;
  };
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        const errorMsg = "Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WEBP";
        setError(errorMsg);
        return null;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const errorMsg = "Kích thước ảnh không được vượt quá 5MB";
        setError(errorMsg);
        return null;
      }

      // Convert file to base64 for temporary storage
      // Images will be uploaded later after property creation
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve({
            success: true,
            message: "File processed successfully",
            data: {
              url: base64String,
              fileName: file.name,
              originalName: file.name,
              size: file.size,
              type: file.type,
            },
          });
        };
        reader.onerror = () => {
          reject(new Error("Có lỗi xảy ra khi đọc file ảnh"));
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      const errorMessage = "Có lỗi xảy ra khi xử lý ảnh";
      setError(errorMessage);
      console.error("File processing error:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadResponse[]> => {
    const promises = files.map(uploadImage);
    const results = await Promise.all(promises);
    return results.filter(
      (result): result is UploadResponse => result !== null
    );
  };

  return {
    uploadImage,
    uploadMultiple,
    isUploading,
    error,
  };
}
