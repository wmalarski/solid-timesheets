import { createQuery } from "@tanstack/solid-query";
import { Suspense, createMemo, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue, TimeEntry } from "~/server/types";
import { getDaysInMonth, getNextMonth } from "~/utils/date";
import { TimeEntryGrid } from "./TimeEntryGrid";
import {
  TimeSheetConfig,
  TimeSheetContext,
  useCreatedTimeSeries,
  useTimeSheetSearchParams,
} from "./TimeSheetTable.utils";

type TimeSheetContextProviderProps = {
  issues: Issue[];
  timeEntries: TimeEntry[];
};

const TimeSheetContextProvider: Component<TimeSheetContextProviderProps> = (
  props
) => {
  const value = useCreatedTimeSeries({ timeEntries: () => props.timeEntries });

  return (
    <TimeSheetContext.Provider value={value}>
      <TimeEntryGrid issues={props.issues} timeEntries={props.timeEntries} />
    </TimeSheetContext.Provider>
  );
};

type TimeEntriesFetcherProps = {
  issues: Issue[];
};

const TimeEntriesFetcher: Component<TimeEntriesFetcherProps> = (props) => {
  const searchParams = useTimeSheetSearchParams();

  const timeEntriesArgs = () => {
    const from = searchParams.params().date;
    const to = getNextMonth(from);
    return { from, limit: 100, to };
  };

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(timeEntriesArgs()),
  }));

  return (
    <Suspense
      fallback={<TimeEntryGrid issues={props.issues} timeEntries={[]} />}
    >
      <TimeSheetContextProvider
        issues={props.issues}
        timeEntries={timeEntriesQuery.data?.time_entries || []}
      />
    </Suspense>
  );
};

const IssuesFetcher: Component = () => {
  const issuesQuery = createQuery(() => ({
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
  }));

  return (
    <Suspense fallback={<TimeEntryGrid issues={[]} timeEntries={[]} />}>
      <TimeEntriesFetcher issues={issuesQuery.data?.issues || []} />
    </Suspense>
  );
};

export const TimeSheetTable: Component = () => {
  const searchParams = useTimeSheetSearchParams();

  const days = createMemo(() => getDaysInMonth(searchParams.params().date));

  return (
    <TimeSheetConfig.Provider value={{ days, ...searchParams }}>
      <IssuesFetcher />
    </TimeSheetConfig.Provider>
  );
};
