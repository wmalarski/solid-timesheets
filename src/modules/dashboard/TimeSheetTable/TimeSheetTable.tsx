import { createQuery } from "@tanstack/solid-query";
import { Suspense, createMemo, createSignal, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
  type CreateTimeEntryArgs,
} from "~/server/timeEntries";
import type { Issue } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { TimeEntryGrid } from "./TimeEntryGrid";
import {
  TimeSheetContext,
  getDaysInMonth,
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
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + 1);
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

const Toolbar: Component = () => {
  const { params, setNextMonth, setPreviousMonth } = useTimeSheetContext();

  return (
    <div>
      <Button onClick={setPreviousMonth}>-</Button>
      <span>{formatRequestDate(params().date)}</span>
      <Button onClick={setNextMonth}>+</Button>
    </div>
  );
};

export const TimeSheetTable: Component = () => {
  const { params, setNextMonth, setPreviousMonth, toggleProject } =
    useTimeSheetSearchParams();

  const days = createMemo(() => getDaysInMonth(params().date));

  const [createdTimeEntries, setCreatedTimeEntries] = createSignal<
    Record<string, CreateTimeEntryArgs[]>
  >({});

  const createTimeEntry = (args: CreateTimeEntryArgs) => {
    setCreatedTimeEntries((current) => {
      const dateKey = formatRequestDate(args.spentOn);
      const dateArgs = current[dateKey] || [];
      const newDateArgs = [...dateArgs, args];
      return { ...current, [dateKey]: newDateArgs };
    });
  };

  return (
    <TimeSheetContext.Provider
      value={{
        createTimeEntry,
        createdTimeEntries,
        days,
        params,
        setNextMonth,
        setPreviousMonth,
        toggleProject,
      }}
    >
      <div class="flex flex-col">
        <Toolbar />
        <ProjectGrid />
      </div>
    </TimeSheetContext.Provider>
  );
};
