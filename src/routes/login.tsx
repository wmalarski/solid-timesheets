import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { Footer, Title } from "~/modules/auth/Layout";
import { SignInAlternative } from "~/modules/auth/SignIn";
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

export default function Home() {
  useRouteData<typeof routeData>();

  return (
    <main class="mx-auto flex flex-col items-center p-4">
      <Title />
      <SignInAlternative />
      <Footer />
    </main>
  );
}
