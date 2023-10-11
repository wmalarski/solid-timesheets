import { createQuery } from "@tanstack/solid-query";
import {
  ErrorBoundary,
  Show,
  Suspense,
  createMemo,
  type Component,
} from "solid-js";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import { useListParams } from "./TimeSheetList.utils";

export const TimeSheetList: Component = () => {
  const { params } = useListParams();

  const queryKey = createMemo(() => {
    const from = params().from;
    const to = params().to;
    return getTimeEntriesKey({ from, to });
  });

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: queryKey(),
    suspense: false,
  }));

  return (
    <ErrorBoundary
      fallback={(error) => <pre>{JSON.stringify(error, null, 2)}</pre>}
    >
      <Suspense>
        <Show when={timeEntriesQuery.data}>
          {(data) => (
            <pre class="h-full overflow-scroll">
              {JSON.stringify(data(), null, 2)}
            </pre>
          )}
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
};
