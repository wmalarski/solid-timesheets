import { createQuery } from "@tanstack/solid-query";
import { Suspense, createMemo, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue } from "~/server/types";
import { getDaysInMonth, getNextMonth } from "~/utils/date";
import { TableToolbar } from "./TableToolbar";
import { TimeEntryGrid } from "./TimeEntryGrid";
import {
  TimeSheetContext,
  useCreatedTimeSeries,
  useTimeSheetContext,
  useTimeSheetSearchParams,
} from "./TimeSheetTable.utils";

type TimeSheetGridProps = {
  issues: Issue[];
};

const TimeSheetGrid: Component<TimeSheetGridProps> = (props) => {
  const { params } = useTimeSheetContext();

  const timeEntriesArgs = () => {
    const from = params().date;
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
      <TimeEntryGrid
        issues={props.issues}
        timeEntries={timeEntriesQuery.data?.time_entries || []}
      />
    </Suspense>
  );
};

const ProjectGrid: Component = () => {
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
      <TimeSheetGrid issues={issuesQuery.data?.issues || []} />
    </Suspense>
  );
};

export const TimeSheetTable: Component = () => {
  const searchParams = useTimeSheetSearchParams();
  const createParams = useCreatedTimeSeries();

  const days = createMemo(() => getDaysInMonth(searchParams.params().date));

  return (
    <TimeSheetContext.Provider
      value={{ ...createParams, ...searchParams, days }}
    >
      <div class="flex flex-col">
        <TableToolbar />
        <ProjectGrid />
      </div>
    </TimeSheetContext.Provider>
  );
};
