// colors.js
// Shared color palette for the Mudiraj World app.
// Import wherever you need consistent theming:
//   import { Colors } from '../constants/colors';

export const Colors = {
  // Brand
  primaryRed: "#B3151C",
  primaryRedDark: "#e60d18",
  logoRed: "#B3151C",
  gold: "#F0A400",
  goldLight: "#F6C90E",
  logoGold: "#F0A400",

  // Gradients (pass directly to expo-linear-gradient's `colors` prop)
  gradientHeader: ["#e40f19", "#f70c17"],
  gradientLogo: ["#e00a14", "#e9111c"],
  gradientGoldAccent: ["#F6C90E", "#F0A400"],
  gradientButton: ["#D9291C", "#F0A400"],
  gradientSplash: ["#FDF5F2", "#FEF3E8", "#FDF5F2"],

  // Backgrounds
  background: "#FDF5F2",
  cardBackground: "#FFFFFF",
  iconCircleBg: "#FDEAE8",

  // Text
  textPrimary: "#2B2B2B",
  textSecondary: "#4B4B4B",
  textMuted: "#6B6B6B",
  placeholder: "#9AA0A6",
  white: "#FFFFFF",

  // Borders / dividers
  border: "#F0F0F0",
  dividerGold: "#EAD9A0",
  checkboxBorder: "#B3151C",

  // Social
  google: "#EA4335",
  facebook: "#1877F2",

  // Status
  success: "#2E7D32",
  error: "#D32F2F",
  warning: "#F0A400",
};

export default Colors;
