// file: web-generator/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-tech cyber palette
        primary: {
          50: "#eef9ff",
          100: "#d8f0ff",
          200: "#b7e4ff",
          300: "#7bd1ff",
          400: "#2fb8ff",
          500: "#0a9ef4",
          600: "#007ed6",
          700: "#0065ad",
          800: "#02558e",
          900: "#084775",
          950: "#052d4d",
        },
        surface: {
          light: "#ffffff",
          dark: "#0f172a",
        },
        accent: {
          glow: "#00f2fe",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px #00f2fe" },
          "50%": { boxShadow: "0 0 20px #00f2fe" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
