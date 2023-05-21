import { useI18n } from "@solid-primitives/i18n";
import { IoTimerSharp } from "solid-icons/io";
import type { Component } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { SignIn } from "~/modules/auth/SignIn";
import { getSession } from "~/server/session";
import { paths } from "~/utils/paths";

export const routeData = () => {
  return createServerData$(async (_source, { env, request }) => {
    const session = await getSession({ env, request });

    if (session) {
      return redirect(paths.timeSheets);
    }

    return null;
  });
};

const Footer: Component = () => {
  const [t] = useI18n();

  return (
    <div class="p-4">
      <a class="link text-xs" href={paths.repository}>
        {t("footer.madeBy")}
      </a>
    </div>
  );
};

const Title: Component = () => {
  const [t] = useI18n();

  return (
    <h1 class="max-6-xs my-16 flex items-center text-center text-6xl font-thin uppercase">
      <IoTimerSharp />
      {t("home.title")}
    </h1>
  );
};

export default function Home() {
  useRouteData<typeof routeData>();

  return (
    <main class="mx-auto flex flex-col items-center p-4 text-gray-700">
      <Title />
      <SignIn />
      <Footer />
    </main>
  );
}
