import { IoLogOutSharp, IoTimerSharp } from "solid-icons/io";
import { type Component } from "solid-js";
import { Button, LinkButton } from "~/components/Button";
import { ThemeSwitch } from "~/components/ThemeSwitch";
import { useI18n } from "~/contexts/I18nContext";
import { createSignOutServerAction } from "~/server/auth";
import { paths } from "~/utils/paths";
import { useDashboardConfig } from "../DashboardConfig";

const SignOut: Component = () => {
  const { t } = useI18n();

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
  const { t } = useI18n();

  const config = useDashboardConfig();

  return (
    <header class="flex w-screen justify-between border-b-[1px] border-base-300 p-2">
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
