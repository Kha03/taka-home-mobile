import React from "react";
import { Stack } from "expo-router";
import FaceVerification from "@/components/auth/FaceVerification";

export default function VerifyFaceScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Xác thực khuôn mặt",
          headerShown: true,
          headerBackTitle: "Quay lại",
        }}
      />
      <FaceVerification />
    </>
  );
}
