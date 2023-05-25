/** @type {import('tailwindcss').Config} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cyberpunkTheme = require("daisyui/src/colors/themes")[
  "[data-theme=cyberpunk]"
];

module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  daisyui: {
    themes: [
      {
        "cyberpunk-light": {
          ...cyberpunkTheme,
          "base-100": "#f8f8f8",
        },
      },
      {
        "cyberpunk-dark": {
          ...cyberpunkTheme,
          "base-100": "#1c1917",
          "base-200": "#292524",
          "base-300": "#57534e",
          "base-content": "#e7e5e4",
          "color-scheme": "dark",
          neutral: "#e7e5e4",
          "neutral-content": "#191D24",
          "neutral-focus": "#111318",
        },
      },
    ],
  },
  darkMode: "class",
  plugins: [require("@kobalte/tailwindcss"), require("daisyui")],
  theme: {
    extend: {
      keyframes: {
        hide: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        slideIn: {
          "0%": {
            transform: "translateX(calc(100% + var(--viewport-padding)))",
          },
          "100%": { transform: "translateX(0)" },
        },
        swipeOut: {
          "0%": { transform: "translateX(var(--kb-toast-swipe-end-x))" },
          "100%": {
            transform: "translateX(calc(100% + var(--viewport-padding)))",
          },
        },
      },
    },
  },
};
