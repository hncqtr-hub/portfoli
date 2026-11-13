import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-navy": "#0D1021",
        "brand-red": "#E31E24",
        "text-primary": "#ffffff",
        "text-accent": "#ffffff",
      },
      fontFamily: {
        "nona-slim": ["Playfair Display", "serif"],
        "nova-slim": ["Playfair Display", "serif"],
        cormorant: ["var(--font-cormorant)", "serif"],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
