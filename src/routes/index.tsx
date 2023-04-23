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
  useRouteData<typeof routeData>();

  return (
    <main class="mx-auto p-4 text-center text-gray-700">
      <h1 class="max-6-xs my-16 text-6xl font-thin uppercase text-sky-700">
        Hello world!
      </h1>
      <SignIn />
    </main>
  );
}
