// src/theme.ts
import { createTheme } from "@mui/material/styles";

/**
 * BarberHair Theme
 * โทน: ดำ / ขาว / เทา (ร้านตัดผม คลีน ดูแพง)
 */
const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#ffffff", // ปุ่มหลัก / action
      contrastText: "#000000",
    },

    secondary: {
      main: "#9ca3af", // เทา
    },

    background: {
      default: "#020617", // slate-950
      paper: "#020617",
    },

    text: {
      primary: "#ffffff",
      secondary: "#9ca3af",
    },

    divider: "rgba(255,255,255,0.08)",
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: [
      "Inter",
      "Noto Sans Thai",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Arial",
    ].join(","),

    h5: {
      fontWeight: 800,
    },

    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // pill
          paddingInline: 20,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
