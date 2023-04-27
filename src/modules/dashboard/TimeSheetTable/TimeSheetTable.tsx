import { useI18n } from "@solid-primitives/i18n";
import { createQuery } from "@tanstack/solid-query";
import {
  For,
  Show,
  Suspense,
  createMemo,
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
  type GetTimeEntriesArgs,
} from "~/server/timeEntries";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { TimeEntryCard } from "./TimeEntryCard/TimeEntryCard";
import {
  getDaysInMonth,
  groupIssues,
  groupTimeEntries,
  useTimeSheetSearchParams,
} from "./TimeSheetTable.utils";

type TableCellProps = JSX.HTMLAttributes<HTMLDivElement>;

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
      <TableCell class="bg-base-100 sticky top-0 z-20 flex p-2" />
      <For each={props.days}>
        {(day) => (
          <TableCell class="bg-base-100 sticky top-0 z-20 flex flex-col p-2">
            <span class="text-3xl">{dayFormat()(day)}</span>
            <span>{weekdayFormat()(day)}</span>
          </TableCell>
        )}
      </For>
    </>
  );
};

type CellProps = {
  entries?: TimeEntry[];
};

const Cell: Component<CellProps> = (props) => {
  return (
    <TableCell class="flex flex-col gap-2 p-2">
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
};

const Row: Component<RowProps> = (props) => {
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
          <Cell entries={props.dayEntryMap?.get(formatRequestDate(day))} />
        )}
      </For>
    </>
  );
};

type RowsGroupProps = {
  days: Date[];
  isHidden: boolean;
  issueDayMap?: Map<number, Map<string, TimeEntry[]>>;
  issues: Issue[];
  onToggle: () => void;
  project: Project;
};

const RowsGroup: Component<RowsGroupProps> = (props) => {
  return (
    <>
      <TableCell
        class="bg-base-200 z-10 flex p-2"
        style={{ "grid-column": `1 / span ${props.days.length + 1}` }}
      >
        <div class="sticky left-2 flex items-center gap-2 text-xl">
          <Badge variant="outline">{props.project.id}</Badge>
          <span>{props.project.name}</span>
          <Button onClick={props.onToggle}>Toggle</Button>
        </div>
      </TableCell>
      <Show when={!props.isHidden}>
        <For each={props.issues}>
          {(issue) => (
            <Row
              dayEntryMap={props.issueDayMap?.get(issue.id)}
              days={props.days}
              issue={issue}
            />
          )}
        </For>
      </Show>
    </>
  );
};

type GridProps = {
  days: Date[];
  hidden: number[];
  groups: ReturnType<typeof groupIssues>;
  onProjectToggle: (projectId: number) => void;
  projectIssuesMap?: ReturnType<typeof groupTimeEntries>;
};

const Grid: Component<GridProps> = (props) => {
  const onToggleFactory = (projectId: number) => {
    const toggle = props.onProjectToggle;
    return () => toggle(projectId);
  };

  return (
    <For each={props.groups}>
      {(projectGroup) => (
        <RowsGroup
          days={props.days}
          isHidden={props.hidden.includes(projectGroup.project.id)}
          issueDayMap={props.projectIssuesMap?.get(projectGroup.project.id)}
          issues={projectGroup.issues}
          onToggle={onToggleFactory(projectGroup.project.id)}
          project={projectGroup.project}
        />
      )}
    </For>
  );
};

type TimeSheetGridProps = {
  args: GetTimeEntriesArgs;
  days: Date[];
  hidden: number[];
  groups: ReturnType<typeof groupIssues>;
  onProjectToggle: (projectId: number) => void;
};

const TimeSheetGrid: Component<TimeSheetGridProps> = (props) => {
  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(props.args),
  }));

  const timeEntryGroups = createMemo(() =>
    groupTimeEntries(timeEntriesQuery.data?.time_entries || [])
  );

  return (
    <Grid
      days={props.days}
      hidden={props.hidden}
      groups={props.groups}
      onProjectToggle={props.onProjectToggle}
      projectIssuesMap={timeEntryGroups()}
    />
  );
};

export const TimeSheetTable: Component = () => {
  const { params, setNextMonth, setPreviousMonth, toggleProject } =
    useTimeSheetSearchParams();

  const timeEntriesArgs = () => {
    const from = params().date;
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + 1);
    return { from, limit: 100, to };
  };

  const issuesQuery = createQuery(() => ({
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
  }));

  const projectGroups = createMemo(() =>
    groupIssues(issuesQuery.data?.issues || [])
  );

  const days = createMemo(() => getDaysInMonth(params().date));

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
          "grid-template-columns": `repeat(${days().length + 1}, auto)`,
        }}
      >
        <Header days={days()} />
        <Suspense
          fallback={
            <Grid
              days={days()}
              hidden={params().hidden}
              groups={projectGroups()}
              onProjectToggle={toggleProject}
            />
          }
        >
          <TimeSheetGrid
            args={timeEntriesArgs()}
            days={days()}
            hidden={params().hidden}
            groups={projectGroups()}
            onProjectToggle={toggleProject}
          />
        </Suspense>
      </div>
    </div>
  );
};
