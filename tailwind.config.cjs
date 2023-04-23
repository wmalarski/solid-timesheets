/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  daisyui: {
    themes: [
      {
        light: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          ...require("daisyui/src/colors/themes")["[data-theme=cyberpunk]"],
          "base-100": "white",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("@kobalte/tailwindcss")],
  theme: { extend: {} },
};
