import { useI18n } from "@solid-primitives/i18n";
import { createQuery } from "@tanstack/solid-query";
import { Show, Suspense, type Component } from "solid-js";
import { LinkButton } from "~/components/Button";
import { getCurrentUserKey, getCurrentUserServerQuery } from "~/server/users";
import { paths } from "~/utils/paths";
import { SignOut } from "./SignOut";

const UserInfo = () => {
  const userQuery = createQuery(() => ({
    queryFn: () => getCurrentUserServerQuery(),
    queryKey: getCurrentUserKey(),
    suspense: true,
  }));

  return (
    <Suspense>
      <Show when={userQuery.data?.user}>
        {(user) => (
          <span class="hidden text-sm sm:block md:text-base">{`${
            user().firstname
          } ${user().lastname}`}</span>
        )}
      </Show>
    </Suspense>
  );
};

export const TopBar: Component = () => {
  const [t] = useI18n();

  return (
    <header class="flex justify-between border-b-[1px] border-gray-300 p-2">
      <nav>
        <LinkButton
          class="text-xl sm:text-2xl md:text-4xl"
          variant="ghost"
          href={paths.timeSheets}
        >
          ⏲{t("dashboard.title")}
        </LinkButton>
      </nav>
      <div class="flex items-center justify-center gap-2">
        <UserInfo />
        <SignOut />
      </div>
    </header>
  );
};
