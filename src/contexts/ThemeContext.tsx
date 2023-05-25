import { createContext, createSignal, useContext } from "solid-js";

export type AppTheme = "cyberpunk-light" | "cyberpunk-dark" | undefined;

export const createThemeValue = () => {
  // TODO read user preference
  const [theme, setTheme] = createSignal<AppTheme>("cyberpunk-light");

  const updateTheme = (theme: AppTheme) => {
    // TODO save to cookie
    setTheme(theme);
  };

  return { setTheme: updateTheme, theme };
};

type ThemeContextValue = ReturnType<typeof createThemeValue>;

export const ThemeContext = createContext<ThemeContextValue>({
  setTheme: () => void 0,
  theme: () => void 0,
});

export const useThemeContext = () => {
  return useContext(ThemeContext);
};
