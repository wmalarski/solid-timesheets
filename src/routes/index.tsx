import { useI18n } from "@solid-primitives/i18n";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { SignIn } from "~/modules/auth/SignIn";
import { getSession } from "~/server/session";
import { paths } from "~/utils/paths";

export const routeData = () => {
  return createServerData$(async (_source, { request }) => {
    const session = await getSession(request);

    if (session) {
      return redirect(paths.timeSheets);
    }

    return null;
  });
};

export default function Home() {
  const [t] = useI18n();

  useRouteData<typeof routeData>();

  return (
    <main class="mx-auto flex flex-col items-center p-4 text-gray-700">
      <h1 class="max-6-xs my-16 text-center text-6xl font-thin uppercase">
        {t("home.title")}
      </h1>
      <SignIn />
    </main>
  );
}
