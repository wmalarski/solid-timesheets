import { createQuery } from "@tanstack/solid-query";
import { Suspense, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue, TimeEntry } from "~/server/types";
import { getNextMonth } from "~/utils/date";
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

const IssuesFetcher: Component = () => {
  const { selectedDate } = useTimeSheetSearchParams();

  const timeEntriesArgs = () => {
    const from = selectedDate();
    const to = getNextMonth(from);
    return { from, limit: 100, to };
  };

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(timeEntriesArgs()),
  }));

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
      <TimeSheetContextProvider
        issues={issuesQuery.data?.issues || []}
        timeEntries={timeEntriesQuery.data?.time_entries || []}
      />
    </Suspense>
  );
};

export const TimeSheetTable: Component = () => {
  const searchParams = useTimeSheetSearchParams();

  return (
    <TimeSheetConfig.Provider value={searchParams}>
      <IssuesFetcher />
    </TimeSheetConfig.Provider>
  );
};
