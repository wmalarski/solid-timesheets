import { Suspense, lazy } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { TimeSheetTable } from "~/modules/dashboard/TimeSheetTable";
import { TopBar } from "~/modules/dashboard/TopBar";
import { getSession } from "~/server/session";
import { paths } from "~/utils/paths";

const ToastProvider = lazy(() =>
  import("~/components/Toast").then((module) => ({
    default: module.ToastProvider,
  }))
);

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
  useRouteData<typeof routeData>();

  return (
    <main class="mx-auto flex h-screen flex-col text-gray-700">
      <TopBar />
      <Suspense>
        <TimeSheetTable />
      </Suspense>
      <Suspense>
        <ToastProvider />
      </Suspense>
    </main>
  );
}
