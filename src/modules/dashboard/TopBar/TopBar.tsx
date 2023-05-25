import { useI18n } from "@solid-primitives/i18n";
import {
  IoLogOutSharp,
  IoMoonOutline,
  IoSunnySharp,
  IoTimerSharp,
} from "solid-icons/io";
import { createMemo, type Component } from "solid-js";
import { Button, LinkButton } from "~/components/Button";
import { useThemeContext } from "~/contexts/ThemeContext";
import { createSignOutServerAction } from "~/server/auth";
import { paths } from "~/utils/paths";
import { useDashboardConfig } from "../DashboardConfig";

const ThemeSwitch: Component = () => {
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

const SignOut: Component = () => {
  const [t] = useI18n();

  const [signOut, { Form }] = createSignOutServerAction();

  return (
    <Form>
      <Button
        disabled={signOut.pending}
        isLoading={signOut.pending}
        size="sm"
        type="submit"
        variant="outline"
      >
        <IoLogOutSharp />
        {t("signOut.button")}
      </Button>
    </Form>
  );
};

export const TopBar: Component = () => {
  const [t] = useI18n();

  const config = useDashboardConfig();

  return (
    <header class="flex justify-between border-b-[1px] border-base-300 p-2">
      <nav>
        <LinkButton
          class="text-xl sm:text-2xl md:text-4xl"
          variant="ghost"
          href={paths.timeSheets}
        >
          <IoTimerSharp />
          {t("dashboard.title")}
        </LinkButton>
      </nav>
      <div class="flex items-center justify-center gap-4">
        <span class="hidden text-xs sm:block md:text-sm">
          {config().fullName}
        </span>
        <ThemeSwitch />
        <SignOut />
      </div>
    </header>
  );
};
