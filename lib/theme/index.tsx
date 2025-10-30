import { createTheme, ThemeProvider as RNEThemeProvider } from "@rneui/themed";
import React from "react";

const theme = createTheme({
  lightColors: {
    primary: "#2196F3",
    secondary: "#03A9F4",
    background: "#FFFFFF",
    white: "#FFFFFF",
    black: "#000000",
    grey0: "#f9f9f9",
    grey1: "#e0e0e0",
    grey2: "#999999",
    grey3: "#666666",
    grey4: "#333333",
    grey5: "#1a1a1a",
    error: "#f44336",
    warning: "#ff9800",
    success: "#4caf50",
  },
  darkColors: {
    primary: "#2196F3",
    secondary: "#03A9F4",
    background: "#121212",
    white: "#FFFFFF",
    black: "#000000",
    grey0: "#1a1a1a",
    grey1: "#333333",
    grey2: "#666666",
    grey3: "#999999",
    grey4: "#e0e0e0",
    grey5: "#f9f9f9",
    error: "#f44336",
    warning: "#ff9800",
    success: "#4caf50",
  },
  components: {
    Button: {
      raised: true,
      titleStyle: {
        fontWeight: "600",
      },
    },
    Input: {
      inputStyle: {
        fontSize: 14,
      },
      errorStyle: {
        fontSize: 12,
      },
    },
    Text: {
      style: {
        fontSize: 14,
      },
    },
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <RNEThemeProvider theme={theme}>{children}</RNEThemeProvider>;
}

export default theme;
