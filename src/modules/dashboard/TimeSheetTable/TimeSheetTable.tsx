import { useI18n } from "@solid-primitives/i18n";
import { createQuery } from "@tanstack/solid-query";
import { For, createMemo, type Component, type JSX } from "solid-js";
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
        <span>{props.entry.id}</span>
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
        <span>{props.issue.id}</span>
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
        class="p-1 text-xl"
        style={{ "grid-column": `1 / span ${props.days.length + 1}` }}
      >
        <span>{props.project.id}</span>
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

export const TimeSheetTable: Component = () => {
  const [, { locale }] = useI18n();

  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey({}),
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

  const days = createMemo(() => getDaysInMonth(new Date()));

  return (
    <div
      class="grid"
      style={{ "grid-template-columns": `repeat(${days().length + 1}, 1fr)` }}
    >
      <TableCell>+</TableCell>
      <For each={days()}>
        {(day) => (
          <TableCell class="flex flex-col p-2">
            <span class="text-3xl">
              {Intl.DateTimeFormat(locale(), { day: "numeric" }).format(day)}
            </span>
            <span>
              {Intl.DateTimeFormat(locale(), { weekday: "long" }).format(day)}
            </span>
          </TableCell>
        )}
      </For>
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
  );
};
