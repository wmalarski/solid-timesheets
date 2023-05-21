import { useI18n } from "@solid-primitives/i18n";
import { IoTimerSharp } from "solid-icons/io";
import { type Component } from "solid-js";
import { LinkButton } from "~/components/Button";
import { paths } from "~/utils/paths";
import { useDashboardConfig } from "../DashboardConfig";
import { SignOut } from "./SignOut";

export const TopBar: Component = () => {
  const [t] = useI18n();

  const config = useDashboardConfig();

  return (
    <header class="flex justify-between border-b-[1px] border-gray-300 p-2">
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
        <SignOut />
      </div>
    </header>
  );
};
