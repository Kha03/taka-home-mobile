import React from "react";
import { Input as RNEInput, InputProps } from "@rneui/themed";
import { StyleSheet } from "react-native";

interface CustomInputProps extends InputProps {
  // Add any custom props here
}

export function CustomInput(props: CustomInputProps) {
  return (
    <RNEInput
      {...props}
      inputContainerStyle={[styles.inputContainer, props.inputContainerStyle]}
      containerStyle={[styles.container, props.containerStyle]}
      inputStyle={[styles.input, props.inputStyle]}
      errorStyle={[styles.error, props.errorStyle]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
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
  error: {
    fontSize: 12,
  },
});
