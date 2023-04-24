import { createQuery } from "@tanstack/solid-query";
import { For, createMemo, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import type { Issue, Project, TimeEntry } from "~/server/types";
import {
  getDaysInMonth,
  groupIssues,
  groupTimeEntries,
} from "./TimeSheetTable.utils";

type TimeSheetCellProps = {
  day: string;
  entries?: TimeEntry[];
};

const TimeSheetCell: Component<TimeSheetCellProps> = (props) => {
  return (
    <div class="border-2 border-gray-800 p-4">
      <pre>{JSON.stringify(props.day, null, 2)}</pre>
      <pre>{JSON.stringify(props.entries, null, 2)}</pre>
    </div>
  );
};

type TimeSheetRowProps = {
  dayEntryMap?: Map<string, TimeEntry[]>;
  days: string[];
  issue: Issue;
};

export const TimeSheetRow: Component<TimeSheetRowProps> = (props) => {
  return (
    <>
      <pre style={{ overflow: "hidden", width: "150px" }}>
        {JSON.stringify(props.issue, null, 2)}
      </pre>
      <For each={props.days}>
        {(day) => (
          <TimeSheetCell day={day} entries={props.dayEntryMap?.get(day)} />
        )}
      </For>
    </>
  );
};

type TimeSheetRowsGroupProps = {
  days: string[];
  issueDayMap?: Map<number, Map<string, TimeEntry[]>>;
  issues: Issue[];
  project: Project;
};

export const TimeSheetRowsGroup: Component<TimeSheetRowsGroupProps> = (
  props
) => {
  return (
    <>
      <pre style={{ "grid-column": `1 / span ${props.days.length + 1}` }}>
        {JSON.stringify(props.project, null, 2)}
      </pre>
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
      <span>+</span>
      <For each={days()}>{(day) => <span>{day}</span>}</For>
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
