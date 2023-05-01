import { useI18n } from "@solid-primitives/i18n";
import { createQuery } from "@tanstack/solid-query";
import {
  For,
  Show,
  Suspense,
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Component,
  type JSX,
} from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { twCx } from "~/components/utils/twCva";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
  type CreateTimeEntryArgs,
} from "~/server/timeEntries";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { TimeEntryCard } from "./TimeEntryCard";
import {
  defaultParams,
  getDaysInMonth,
  groupIssuesByProject,
  groupTimeEntries,
  sumDayTimeEntriesHours,
  sumDayTimeEntriesMap,
  sumTimeEntriesHoursByDay,
  useTimeSheetSearchParams,
  type TimeSheetSearchParams,
} from "./TimeSheetTable.utils";

type TimeSheetContextValue = {
  createTimeEntry: (args: CreateTimeEntryArgs) => void;
  createdTimeEntries: () => Record<string, CreateTimeEntryArgs[]>;
  days: () => Date[];
  params: () => TimeSheetSearchParams;
  setNextMonth: () => void;
  setPreviousMonth: () => void;
  toggleProject: (id: number) => void;
};

const TimeSheetContext = createContext<TimeSheetContextValue>({
  createTimeEntry: () => void 0,
  createdTimeEntries: () => ({}),
  days: () => [],
  params: () => defaultParams,
  setNextMonth: () => void 0,
  setPreviousMonth: () => void 0,
  toggleProject: () => void 0,
});

const useTimeSheetContext = () => {
  return useContext(TimeSheetContext);
};

const TableCell: Component<JSX.IntrinsicElements["div"]> = (props) => {
  return (
    <div
      {...props}
      class={twCx("border-b-[1px] border-r-[1px] border-gray-300", props.class)}
    />
  );
};

const Header: Component = () => {
  const [, { locale }] = useI18n();

  const { days } = useTimeSheetContext();

  const dayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { day: "numeric" }).format;
  });

  const weekdayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { weekday: "long" }).format;
  });

  return (
    <>
      <TableCell class="bg-base-100 sticky left-0 top-0 z-30 flex p-2" />
      <For each={days()}>
        {(day) => (
          <TableCell class="bg-base-100 sticky top-0 z-20 flex flex-col p-2">
            <span class="text-3xl">{dayFormat()(day)}</span>
            <span>{weekdayFormat()(day)}</span>
          </TableCell>
        )}
      </For>
      <TableCell class="bg-base-100 sticky right-0 top-0 z-30 flex border-l-[1px] p-2" />
    </>
  );
};

type CellProps = {
  entries?: TimeEntry[];
  onCreateClick: () => void;
};

const Cell: Component<CellProps> = (props) => {
  return (
    <TableCell class="flex flex-col gap-2 p-2">
      <div>
        <Button onClick={props.onCreateClick} variant="outline" size="xs">
          +
        </Button>
      </div>
      <For each={props.entries}>
        {(entry) => <TimeEntryCard entry={entry} />}
      </For>
    </TableCell>
  );
};

type RowProps = {
  dayEntryMap?: Map<string, TimeEntry[]>;
  issue: Issue;
};

const Row: Component<RowProps> = (props) => {
  const { days, createTimeEntry } = useTimeSheetContext();

  const hoursSum = createMemo(() => {
    return sumDayTimeEntriesMap(props.dayEntryMap);
  });

  const onCreateClick = (day: Date) => {
    createTimeEntry({
      comments: "",
      hours: 0,
      issueId: props.issue.id,
      spentOn: day,
    });
  };

  return (
    <>
      <TableCell class="bg-base-100 sticky left-0 z-10 flex w-64">
        <div class="flex flex-col p-2">
          <Badge variant="outline">{props.issue.id}</Badge>
          <span>{props.issue.subject}</span>
        </div>
      </TableCell>
      <For each={days()}>
        {(day) => (
          <Cell
            entries={props.dayEntryMap?.get(formatRequestDate(day))}
            onCreateClick={() => onCreateClick(day)}
          />
        )}
      </For>
      <TableCell class="bg-base-100 sticky right-0 z-10 flex border-l-[1px]">
        <div class="flex flex-col p-2">
          <span>{hoursSum()}</span>
        </div>
      </TableCell>
    </>
  );
};

type RowsGroupProps = {
  issueDayMap?: Map<number, Map<string, TimeEntry[]>>;
  issues: Issue[];
  project: Project;
};

const RowsGroup: Component<RowsGroupProps> = (props) => {
  const { toggleProject, days, params } = useTimeSheetContext();

  const onToggleProject = () => {
    toggleProject(props.project.id);
  };

  return (
    <>
      <TableCell
        class="bg-base-200 z-10 flex p-2"
        style={{ "grid-column": `1 / span ${days().length + 2}` }}
      >
        <div class="sticky left-2 flex items-center gap-2 text-xl">
          <Badge variant="outline">{props.project.id}</Badge>
          <span>{props.project.name}</span>
          <Button onClick={onToggleProject} size="xs">
            ^
          </Button>
        </div>
      </TableCell>
      <Show when={!params().hidden.includes(props.project.id)}>
        <For each={props.issues}>
          {(issue) => (
            <Row dayEntryMap={props.issueDayMap?.get(issue.id)} issue={issue} />
          )}
        </For>
      </Show>
    </>
  );
};

type FooterProps = {
  timeEntries: TimeEntry[];
};

const Footer: Component<FooterProps> = (props) => {
  const { days } = useTimeSheetContext();

  const timeEntryDayHoursGroups = createMemo(() => {
    return sumTimeEntriesHoursByDay(props.timeEntries);
  });

  const timeEntryHours = createMemo(() => {
    return sumDayTimeEntriesHours(props.timeEntries);
  });

  return (
    <>
      <TableCell class="bg-base-100 sticky bottom-0 left-0 z-30 flex border-t-[1px] p-2" />
      <For each={days()}>
        {(day) => (
          <TableCell class="bg-base-100 sticky bottom-0 z-20 flex flex-col border-t-[1px] p-2">
            <span>{timeEntryDayHoursGroups().get(formatRequestDate(day))}</span>
          </TableCell>
        )}
      </For>
      <TableCell class="bg-base-100 sticky bottom-0 right-0 z-30 flex border-l-[1px] border-t-[1px] p-2">
        {timeEntryHours()}
      </TableCell>
    </>
  );
};

type GridProps = {
  groups: ReturnType<typeof groupIssuesByProject>;
  timeEntries: TimeEntry[];
};

const Grid: Component<GridProps> = (props) => {
  const timeEntryGroups = createMemo(() => groupTimeEntries(props.timeEntries));

  const { days } = useTimeSheetContext();

  return (
    <div
      class="w-max-[100vw] grid max-h-[80vh] overflow-scroll"
      style={{ "grid-template-columns": `repeat(${days().length + 2}, auto)` }}
    >
      <Header />
      <For each={props.groups}>
        {(projectGroup) => (
          <RowsGroup
            issueDayMap={timeEntryGroups().get(projectGroup.project.id)}
            issues={projectGroup.issues}
            project={projectGroup.project}
          />
        )}
      </For>
      <Footer timeEntries={props.timeEntries} />
    </div>
  );
};

type TimeSheetGridProps = {
  groups: ReturnType<typeof groupIssuesByProject>;
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
    <Suspense fallback={<Grid groups={props.groups} timeEntries={[]} />}>
      <Grid
        groups={props.groups}
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

  const projectGroups = createMemo(() =>
    groupIssuesByProject(issuesQuery.data?.issues || [])
  );

  return (
    <Suspense fallback={<Grid groups={[]} timeEntries={[]} />}>
      <TimeSheetGrid groups={projectGroups()} />
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
