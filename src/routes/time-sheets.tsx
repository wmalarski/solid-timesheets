import { Show, Suspense, lazy } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { DashboardConfigContext } from "~/modules/dashboard/DashboardConfig";
import { TimeSheetTable } from "~/modules/dashboard/TimeSheetTable";
import { TopBar } from "~/modules/dashboard/TopBar";
import { serverEnv } from "~/server/env";
import { getSession } from "~/server/session";
import { paths } from "~/utils/paths";

const ToastProvider = lazy(() =>
  import("~/components/Toast").then((module) => ({
    default: module.ToastProvider,
  }))
);

const PendingProcess = lazy(() =>
  import("~/modules/dashboard/PendingProcess").then((module) => ({
    default: module.PendingProcess,
  }))
);

export const routeData = () => {
  return createServerData$(async (_source, { request }) => {
    const session = await getSession(request);

    if (!session) {
      throw redirect(paths.home);
    }

    return {
      fullName: session.fullName,
      rmBaseUrl: serverEnv.RM_BASE_URL,
      userId: session.id,
    };
  });
};

export default function TimeSheets() {
  const data = useRouteData<typeof routeData>();

  return (
    <Show when={data()}>
      {(result) => (
        <DashboardConfigContext.Provider value={result}>
          <main class="mx-auto flex h-screen flex-col text-gray-700">
            <TopBar />
            <Suspense>
              <TimeSheetTable />
            </Suspense>
            <Suspense>
              <PendingProcess />
              <ToastProvider />
            </Suspense>
          </main>
        </DashboardConfigContext.Provider>
      )}
    </Show>
  );
}
