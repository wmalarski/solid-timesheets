import { Show, Suspense, lazy } from "solid-js";
import { Outlet, useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { DashboardConfigContext } from "~/modules/dashboard/DashboardConfig";
import { TopBar } from "~/modules/dashboard/TopBar";
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
  return createServerData$(async (_source, { env, request }) => {
    const session = await getSession({ env, request });

    if (!session) {
      throw redirect(paths.home);
    }

    return {
      fullName: session.fullName,
      rmBaseUrl: env.RM_BASE_URL,
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
          <main class="flex h-screen max-h-screen flex-col overflow-y-hidden">
            <TopBar />
            <Outlet />
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
