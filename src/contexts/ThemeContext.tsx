import { createContext, createSignal, useContext } from "solid-js";
import { getCookies, setCookie } from "~/utils/cookies";

export const themeCookieName = "theme-preference";

export type AppTheme = "cyberpunk-light" | "cyberpunk-dark" | undefined;

const types = ["cyberpunk-light", "cyberpunk-dark"];

const sanitizeValue = (initial: unknown) => {
  if (typeof initial === "string" && types.includes(initial)) {
    return initial as AppTheme;
  }
};

export const createThemeValue = () => {
  const initialTheme = sanitizeValue(getCookies()[themeCookieName]);

  const [theme, setTheme] = createSignal<AppTheme>(initialTheme);

  const updateTheme = (theme: AppTheme) => {
    setCookie({ name: themeCookieName, value: theme });
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
