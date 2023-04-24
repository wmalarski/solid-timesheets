import { Suspense } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { TimeSheetTable } from "~/modules/dashboard/TimeSheetTable";
import { TopBar } from "~/modules/dashboard/TopBar";
import { getSession } from "~/server/session";
import { paths } from "~/utils/paths";

export const routeData = () => {
  return createServerData$(async (_source, { request }) => {
    const session = await getSession(request);

    if (!session) {
      return redirect(paths.home);
    }

    return session;
  });
};

export default function TimeSheets() {
  const sessionResource = useRouteData<typeof routeData>();

  return (
    <main class="mx-auto flex flex-col text-gray-700">
      <TopBar />
      <Suspense>
        <pre>{JSON.stringify(sessionResource(), null, 2)}</pre>
        <TimeSheetTable />
      </Suspense>
    </main>
  );
}
