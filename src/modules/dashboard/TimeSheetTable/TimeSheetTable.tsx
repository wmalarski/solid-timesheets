import { useI18n } from "@solid-primitives/i18n";
import { createQuery } from "@tanstack/solid-query";
import { For, Suspense, createMemo, type Component, type JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { twCx } from "~/components/utils/twCva";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
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

type TimeSheetCellCardProps = {
  entry: TimeEntry;
};

const TimeSheetCellCard: Component<TimeSheetCellCardProps> = (props) => {
  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <Badge variant="outline">{props.entry.id}</Badge>
        <span>{props.entry.comments}</span>
        <span>{props.entry.hours}</span>
      </CardBody>
    </Card>
  );
};

type TimeSheetCellProps = {
  entries?: TimeEntry[];
};

const TimeSheetCell: Component<TimeSheetCellProps> = (props) => {
  return (
    <TableCell class="flex flex-col gap-2 p-2">
      <For each={props.entries}>
        {(entry) => <TimeSheetCellCard entry={entry} />}
      </For>
    </TableCell>
  );
};

type TimeSheetRowProps = {
  dayEntryMap?: Map<string, TimeEntry[]>;
  days: Date[];
  issue: Issue;
};

export const TimeSheetRow: Component<TimeSheetRowProps> = (props) => {
  return (
    <>
      <TableCell class="flex w-60 flex-col gap-2 overflow-hidden p-2">
        <Badge variant="outline">{props.issue.id}</Badge>
        <span>{props.issue.subject}</span>
      </TableCell>
      <For each={props.days}>
        {(day) => (
          <TimeSheetCell
            entries={props.dayEntryMap?.get(formatRequestDate(day))}
          />
        )}
      </For>
    </>
  );
};

type TimeSheetRowsGroupProps = {
  days: Date[];
  issueDayMap?: Map<number, Map<string, TimeEntry[]>>;
  issues: Issue[];
  project: Project;
};

export const TimeSheetRowsGroup: Component<TimeSheetRowsGroupProps> = (
  props
) => {
  return (
    <>
      <TableCell
        class="flex items-center gap-2 p-2 text-xl"
        style={{ "grid-column": `1 / span ${props.days.length + 1}` }}
      >
        <Badge variant="outline">{props.project.id}</Badge>
        <span>{props.project.name}</span>
      </TableCell>
      <For each={props.issues}>
        {(issue) => (
          <TimeSheetRow
            dayEntryMap={props.issueDayMap?.get(issue.id)}
            days={props.days}
            issue={issue}
          />
        )}
      </For>
    </>
  );
};

type TimeSheetHeaderProps = {
  days: Date[];
};

const TimeSheetHeader: Component<TimeSheetHeaderProps> = (props) => {
  const [, { locale }] = useI18n();

  const dayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { day: "numeric" }).format;
  });

  const weekdayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { weekday: "long" }).format;
  });

  return (
    <>
      <TableCell />
      <For each={props.days}>
        {(day) => (
          <TableCell class="flex flex-col p-2">
            <span class="text-3xl">{dayFormat()(day)}</span>
            <span>{weekdayFormat()(day)}</span>
          </TableCell>
        )}
      </For>
    </>
  );
};

export const TimeSheetTable: Component = () => {
  const { params, setNextMonth, setPreviousMonth } = useTimeSheetSearchParams();

  const timeEntriesArgs = () => {
    const from = params().date;
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + 1);
    return { from, limit: 100, to };
  };

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey({ ...timeEntriesArgs() }),
    suspense: true,
  }));

  const timeEntryGroups = createMemo(() =>
    groupTimeEntries(timeEntriesQuery.data?.time_entries || [])
  );

  const issuesQuery = createQuery(() => ({
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
    suspense: true,
  }));

  const projectGroups = createMemo(() =>
    groupIssues(issuesQuery.data?.issues || [])
  );

  const days = createMemo(() => getDaysInMonth(params().date));

  return (
    <div class="flex flex-col">
      <div>
        <Button onClick={setPreviousMonth}>-</Button>
        {/* <pre>{JSON.stringify(params(), null, 2)}</pre> */}
        <span>{formatRequestDate(params().date)}</span>
        <Button onClick={setNextMonth}>+</Button>
      </div>
      <Suspense>
        <div
          class="grid"
          style={{
            "grid-template-columns": `repeat(${days().length + 1}, 1fr)`,
          }}
        >
          <TimeSheetHeader days={days()} />
          <For each={projectGroups()}>
            {(projectGroup) => (
              <TimeSheetRowsGroup
                days={days()}
                issues={projectGroup.issues}
                project={projectGroup.project}
                issueDayMap={timeEntryGroups().get(projectGroup.project.id)}
              />
            )}
          </For>
        </div>
      </Suspense>
    </div>
  );
};
