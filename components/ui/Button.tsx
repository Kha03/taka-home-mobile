import React from "react";
import { Button as RNEButton, ButtonProps } from "@rneui/themed";
import { StyleSheet } from "react-native";

interface CustomButtonProps extends ButtonProps {
  // Add any custom props here
}

export function CustomButton(props: CustomButtonProps) {
  return (
    <RNEButton
      {...props}
      buttonStyle={[styles.button, props.buttonStyle]}
      titleStyle={[styles.title, props.titleStyle]}
      containerStyle={[styles.container, props.containerStyle]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    // Add default container styles
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: "#071658",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
});
