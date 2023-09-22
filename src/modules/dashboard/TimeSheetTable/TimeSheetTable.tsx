import { createQuery, isServer } from "@tanstack/solid-query";
import { createMemo, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import { getDaysInMonth, getNextMonth } from "~/utils/date";
import { TimeEntryGrid } from "./TimeEntryGrid";
import { useTimeSheetSearchParams } from "./TimeSheetTable.utils";
import { TrackingStoreProvider } from "./TrackingStore";

type ProviderProps = {
  days: Date[];
  selectedDate: Date;
};

const Provider: Component<ProviderProps> = (props) => {
  const timeEntriesArgs = createMemo(() => {
    const from = props.selectedDate;
    const to = getNextMonth(from);
    return { from, limit: 100, to };
  });

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
    <TimeEntryGrid
      days={props.days}
      issues={issuesQuery.data?.issues || []}
      timeEntries={timeEntriesQuery.data?.time_entries || []}
    />
  );
};

export const TimeSheetTable: Component = () => {
  const { selectedDate } = useTimeSheetSearchParams();
  const days = createMemo(() => getDaysInMonth(selectedDate()));

  return (
    <TrackingStoreProvider>
      <Provider days={days()} selectedDate={selectedDate()} />
    </TrackingStoreProvider>
  );
};
