import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#1a1a1a",
        "surface-elevated": "#27272a",
        border: "#3f3f46",
        accent: "#3b82f6",
        "text-primary": "#ffffff",
        "text-secondary": "#a1a1aa",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
