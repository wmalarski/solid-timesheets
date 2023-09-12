import { createQuery } from "@tanstack/solid-query";
import { Suspense, type Component } from "solid-js";
import { isServer } from "solid-js/web";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue, TimeEntry } from "~/server/types";
import { getNextMonth } from "~/utils/date";
import { TimeSheetContext, useCreatedTimeSeries } from "./EntriesStore";
import { TimeEntryGrid } from "./TimeEntryGrid";
import { useTimeSheetSearchParams } from "./TimeSheetTable.utils";
import { TrackingStoreContext, useTrackingStore } from "./TrackingStore";

type ProviderProps = {
  issues: Issue[];
  timeEntries: TimeEntry[];
};

const Provider: Component<ProviderProps> = (props) => {
  const trackingStore = useTrackingStore();
  const value = useCreatedTimeSeries({ timeEntries: () => props.timeEntries });

  return (
    <TrackingStoreContext.Provider value={trackingStore}>
      <TimeSheetContext.Provider value={value}>
        <TimeEntryGrid issues={props.issues} timeEntries={props.timeEntries} />
      </TimeSheetContext.Provider>
    </TrackingStoreContext.Provider>
  );
};

export const TimeSheetTable: Component = () => {
  const { selectedDate } = useTimeSheetSearchParams();

  const timeEntriesArgs = () => {
    const from = selectedDate();
    const to = getNextMonth(from);
    return { from, limit: 100, to };
  };

  const timeEntriesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(timeEntriesArgs()),
  }));

  const issuesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
  }));

  return (
    <Suspense fallback={<TimeEntryGrid issues={[]} timeEntries={[]} />}>
      <Provider
        issues={issuesQuery.data?.issues || []}
        timeEntries={timeEntriesQuery.data?.time_entries || []}
      />
    </Suspense>
  );
};
