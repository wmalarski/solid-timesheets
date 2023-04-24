import { useI18n } from "@solid-primitives/i18n";
import { type Component } from "solid-js";
import { LinkButton } from "~/components/Button";
import { paths } from "~/utils/paths";
import { SignOut } from "./SignOut";

export const TopBar: Component = () => {
  const [t] = useI18n();

  return (
    <header class="flex justify-between border-b-[1px] border-gray-300 p-2">
      <nav>
        <LinkButton class="text-4xl" variant="ghost" href={paths.timeSheets}>
          {t("dashboard.title")}
        </LinkButton>
      </nav>
      <SignOut />
    </header>
  );
};
