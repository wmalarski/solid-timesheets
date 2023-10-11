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
import {
  TimeEntryErroredList,
  TimeEntryList,
  TimeEntryLoadingList,
} from "./TimeEntryList";
import { useListParams } from "./TimeSheetList.utils";

export const TimeSheetList: Component = () => {
  const { params, setParams } = useListParams();

  const queryKey = createMemo(() => {
    const value = params();
    return getTimeEntriesKey({
      from: value.from,
      issueId: value.issue,
      sort: "spent_on",
      to: value.to,
    });
  });

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: queryKey(),
  }));

  const onIssueChange = (issueId: number) => {
    setParams({ ...params(), issue: issueId });
  };

  return (
    <ErrorBoundary fallback={() => <TimeEntryErroredList />}>
      <Suspense fallback={<TimeEntryLoadingList />}>
        <Show when={timeEntriesQuery.data}>
          {(data) => (
            <div class="flex h-full flex-col overflow-scroll">
              <IssueFilterDialog
                issueId={params().issue}
                onIssueChange={onIssueChange}
              />
              <pre>{JSON.stringify(params(), null, 2)}</pre>
              <TimeEntryList timeEntries={data()} />
            </div>
          )}
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
};
