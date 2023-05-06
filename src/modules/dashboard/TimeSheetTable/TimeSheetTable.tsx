import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { Suspense, createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  createTimeEntriesServerMutation,
  getAllTimeEntriesKey,
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { TimeEntryGrid } from "./TimeEntryGrid";
import {
  TimeSheetContext,
  getDaysInMonth,
  sumCreatedTimeEntries,
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
  const [t] = useI18n();

  const {
    createdTimeEntries,
    params,
    setCreatedTimeEntries,
    setNextMonth,
    setPreviousMonth,
  } = useTimeSheetContext();

  const count = createMemo(() => sumCreatedTimeEntries(createdTimeEntries.map));

  const onDeleteAllClick = () => {
    setCreatedTimeEntries({ map: {} });
  };

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntriesServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setCreatedTimeEntries({ map: {} });
    },
  }));

  const onSaveClick = () => {
    const args = Object.values(createdTimeEntries.map).flat();
    mutation.mutate(args);
  };

  return (
    <div class="flex justify-between gap-2 p-2">
      <div class="flex gap-1">
        <Button size="xs" variant="outline" onClick={setPreviousMonth}>
          -
        </Button>
        <span>{formatRequestDate(params().date)}</span>
        <Button size="xs" variant="outline" onClick={setNextMonth}>
          +
        </Button>
      </div>
      <div>
        <Button
          color="error"
          disabled={count() < 1 || mutation.isPending}
          onClick={onDeleteAllClick}
          size="xs"
          variant="outline"
        >
          {t("dashboard.reset", { count: String(count()) })}
        </Button>
        <Button
          color="success"
          disabled={count() < 1 || mutation.isPending}
          onClick={onSaveClick}
          size="xs"
          variant="outline"
        >
          {t("dashboard.saveAll", { count: String(count()) })}
        </Button>
      </div>
    </div>
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
        <Toolbar />
        <ProjectGrid />
      </div>
    </TimeSheetContext.Provider>
  );
};
