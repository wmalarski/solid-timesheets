/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  daisyui: {
    themes: [
      {
        light: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          ...require("daisyui/src/colors/themes")["[data-theme=cyberpunk]"],
          "base-100": "#f8f8f8",
        },
      },
    ],
  },
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
