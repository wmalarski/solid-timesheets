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
import { IssueFilterDialog } from "./IssueFilterDialog";
import { useListParams } from "./TimeSheetList.utils";

export const TimeSheetList: Component = () => {
  const { params, setParams } = useListParams();

  const queryKey = createMemo(() => {
    const from = params().from;
    const to = params().to;
    return getTimeEntriesKey({ from, sort: "spent_on", to });
  });

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: queryKey(),
  }));

  const onIssueChange = (issueId: number) => {
    setParams({ ...params(), issue: issueId });
  };

  return (
    <ErrorBoundary
      fallback={() => <pre>{JSON.stringify("error", null, 2)}</pre>}
    >
      <Suspense>
        <Show when={timeEntriesQuery.data}>
          {(data) => (
            <div class="flex h-full flex-col overflow-scroll">
              <IssueFilterDialog
                issueId={params().issue}
                onIssueChange={onIssueChange}
              />
              <pre>{JSON.stringify(params(), null, 2)}</pre>
              <pre class="">{JSON.stringify(data(), null, 2)}</pre>
            </div>
          )}
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
};
