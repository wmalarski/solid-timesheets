import { useI18n } from "@solid-primitives/i18n";
import { IoMoonOutline, IoSunnySharp } from "solid-icons/io";
import { createMemo, type Component } from "solid-js";
import { useThemeContext } from "~/contexts/ThemeContext";

export const ThemeSwitch: Component = () => {
  const [t] = useI18n();

  const { setTheme, theme } = useThemeContext();

  const isLight = createMemo(() => {
    return theme() === "cyberpunk-light";
  });

  const onClick = () => {
    setTheme(isLight() ? "cyberpunk-dark" : "cyberpunk-light");
  };

  return (
    // eslint-disable-next-line tailwindcss/classnames-order
    <label class="swap swap-rotate">
      <input type="checkbox" onChange={onClick} checked={isLight()} />
      <IoSunnySharp class="swap-on h-6 w-6" aria-label={t("theme.setLight")} />
      <IoMoonOutline class="swap-off h-6 w-6" aria-label={t("theme.setDark")} />
    </label>
  );
};
