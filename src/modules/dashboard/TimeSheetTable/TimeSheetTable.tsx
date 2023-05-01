import { useI18n } from "@solid-primitives/i18n";
import { createQuery } from "@tanstack/solid-query";
import {
  For,
  Show,
  Suspense,
  createMemo,
  createSignal,
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
  type GetTimeEntriesArgs,
} from "~/server/timeEntries";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { TimeEntryCard } from "./TimeEntryCard";
import {
  getDaysInMonth,
  groupIssuesByProject,
  groupTimeEntries,
  sumDayTimeEntriesHours,
  sumDayTimeEntriesMap,
  sumTimeEntriesHoursByDay,
  useTimeSheetSearchParams,
} from "./TimeSheetTable.utils";

type TableCellProps = JSX.IntrinsicElements["div"];

const TableCell: Component<TableCellProps> = (props) => {
  return (
    <div
      {...props}
      class={twCx("border-b-[1px] border-r-[1px] border-gray-300", props.class)}
    />
  );
};

type HeaderProps = {
  days: Date[];
};

const Header: Component<HeaderProps> = (props) => {
  const [, { locale }] = useI18n();

  const dayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { day: "numeric" }).format;
  });

  const weekdayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { weekday: "long" }).format;
  });

  return (
    <>
      <TableCell class="bg-base-100 sticky left-0 top-0 z-30 flex p-2" />
      <For each={props.days}>
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

type CellHeaderProps = {
  onCreateClick: () => void;
};

const CellHeader: Component<CellHeaderProps> = (props) => {
  return (
    <div>
      <Button onClick={props.onCreateClick} variant="outline">
        +
      </Button>
    </div>
  );
};

type CellProps = {
  entries?: TimeEntry[];
  onCreateClick: () => void;
};

const Cell: Component<CellProps> = (props) => {
  return (
    <TableCell class="flex flex-col gap-2 p-2">
      <CellHeader onCreateClick={props.onCreateClick} />
      <For each={props.entries}>
        {(entry) => <TimeEntryCard entry={entry} />}
      </For>
    </TableCell>
  );
};

type RowProps = {
  dayEntryMap?: Map<string, TimeEntry[]>;
  days: Date[];
  issue: Issue;
  onCreateTimeEntry: (args: CreateTimeEntryArgs) => void;
};

const Row: Component<RowProps> = (props) => {
  const hoursSum = createMemo(() => {
    return sumDayTimeEntriesMap(props.dayEntryMap);
  });

  const onCreateClick = (day: Date) => {
    props.onCreateTimeEntry({
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
      <For each={props.days}>
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
  days: Date[];
  isHidden: boolean;
  issueDayMap?: Map<number, Map<string, TimeEntry[]>>;
  issues: Issue[];
  onCreateTimeEntry: (args: CreateTimeEntryArgs) => void;
  onToggle: () => void;
  project: Project;
};

const RowsGroup: Component<RowsGroupProps> = (props) => {
  return (
    <>
      <TableCell
        class="bg-base-200 z-10 flex p-2"
        style={{ "grid-column": `1 / span ${props.days.length + 2}` }}
      >
        <div class="sticky left-2 flex items-center gap-2 text-xl">
          <Badge variant="outline">{props.project.id}</Badge>
          <span>{props.project.name}</span>
          <Button onClick={props.onToggle} size="xs">
            ^
          </Button>
        </div>
      </TableCell>
      <Show when={!props.isHidden}>
        <For each={props.issues}>
          {(issue) => (
            <Row
              dayEntryMap={props.issueDayMap?.get(issue.id)}
              days={props.days}
              issue={issue}
              onCreateTimeEntry={props.onCreateTimeEntry}
            />
          )}
        </For>
      </Show>
    </>
  );
};

type FooterProps = {
  days: Date[];
  timeEntries: TimeEntry[];
};

const Footer: Component<FooterProps> = (props) => {
  const timeEntryDayHoursGroups = createMemo(() => {
    return sumTimeEntriesHoursByDay(props.timeEntries);
  });

  const timeEntryHours = createMemo(() => {
    return sumDayTimeEntriesHours(props.timeEntries);
  });

  return (
    <>
      <TableCell class="bg-base-100 sticky bottom-0 left-0 z-30 flex border-t-[1px] p-2" />
      <For each={props.days}>
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
  days: Date[];
  createdTimeEntries: Record<string, CreateTimeEntryArgs[]>;
  groups: ReturnType<typeof groupIssuesByProject>;
  hidden: number[];
  onProjectToggle: (projectId: number) => void;
  onCreateTimeEntry: (args: CreateTimeEntryArgs) => void;
  timeEntries: TimeEntry[];
};

const Grid: Component<GridProps> = (props) => {
  const timeEntryGroups = createMemo(() => groupTimeEntries(props.timeEntries));

  const onToggleFactory = (projectId: number) => {
    const toggle = props.onProjectToggle;
    return () => toggle(projectId);
  };

  return (
    <div
      class="w-max-[100vw] grid max-h-[80vh] overflow-scroll"
      style={{
        "grid-template-columns": `repeat(${props.days.length + 2}, auto)`,
      }}
    >
      <Header days={props.days} />
      <For each={props.groups}>
        {(projectGroup) => (
          <RowsGroup
            days={props.days}
            isHidden={props.hidden.includes(projectGroup.project.id)}
            issueDayMap={timeEntryGroups().get(projectGroup.project.id)}
            issues={projectGroup.issues}
            onToggle={onToggleFactory(projectGroup.project.id)}
            project={projectGroup.project}
            onCreateTimeEntry={props.onCreateTimeEntry}
          />
        )}
      </For>
      <Footer days={props.days} timeEntries={props.timeEntries} />
    </div>
  );
};

type TimeSheetGridProps = {
  createdTimeEntries: Record<string, CreateTimeEntryArgs[]>;
  days: Date[];
  hidden: number[];
  groups: ReturnType<typeof groupIssuesByProject>;
  startDate: Date;
  onCreateTimeEntry: (args: CreateTimeEntryArgs) => void;
  onProjectToggle: (projectId: number) => void;
};

const TimeSheetGrid: Component<TimeSheetGridProps> = (props) => {
  const timeEntriesArgs = () => {
    const from = props.startDate;
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + 1);
    return { from, limit: 100, to };
  };

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(timeEntriesArgs()),
  }));

  return (
    <>
      <Grid
        createdTimeEntries={props.createdTimeEntries}
        days={props.days}
        groups={props.groups}
        hidden={props.hidden}
        onCreateTimeEntry={props.onCreateTimeEntry}
        onProjectToggle={props.onProjectToggle}
        timeEntries={timeEntriesQuery.data?.time_entries || []}
      />
    </>
  );
};

type ProjectGridProps = {
  args: GetTimeEntriesArgs;
  createdTimeEntries: Record<string, CreateTimeEntryArgs[]>;
  days: Date[];
  hidden: number[];
  groups: ReturnType<typeof groupIssuesByProject>;
  onCreateTimeEntry: (args: CreateTimeEntryArgs) => void;
  onProjectToggle: (projectId: number) => void;
};

const ProjectGrid: Component<ProjectGridProps> = (props) => {
  const { params, toggleProject } = useTimeSheetSearchParams();

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
    <Suspense
      fallback={
        <Grid
          createdTimeEntries={{}}
          days={props.days}
          groups={[]}
          hidden={params().hidden}
          onCreateTimeEntry={() => void 0}
          onProjectToggle={toggleProject}
          timeEntries={[]}
        />
      }
    >
      <TimeSheetGrid
        startDate={params().date}
        createdTimeEntries={createdEntries()}
        days={props.days}
        groups={projectGroups()}
        hidden={params().hidden}
        onCreateTimeEntry={onCreateTimeEntry}
        onProjectToggle={toggleProject}
      />
    </Suspense>
  );
};

export const TimeSheetTable: Component = () => {
  const { params, setNextMonth, setPreviousMonth, toggleProject } =
    useTimeSheetSearchParams();

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

  const days = createMemo(() => getDaysInMonth(params().date));

  const [createdEntries, setCreatedEntries] = createSignal<
    Record<string, CreateTimeEntryArgs[]>
  >({});

  const onCreateTimeEntry = (args: CreateTimeEntryArgs) => {
    setCreatedEntries((current) => {
      const dateKey = formatRequestDate(args.spentOn);
      const dateArgs = current[dateKey] || [];
      const newDateArgs = [...dateArgs, args];
      return { ...current, [dateKey]: newDateArgs };
    });
  };

  return (
    <div class="flex flex-col">
      <div>
        <Button onClick={setPreviousMonth}>-</Button>
        <span>{formatRequestDate(params().date)}</span>
        <Button onClick={setNextMonth}>+</Button>
      </div>
      <div
        class="w-max-[100vw] grid max-h-[80vh] overflow-scroll"
        style={{
          "grid-template-columns": `repeat(${days().length + 2}, auto)`,
        }}
      >
        <ProjectGrid />
      </div>
    </div>
  );
};
