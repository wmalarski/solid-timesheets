import { useI18n } from "@solid-primitives/i18n";
import { For, Show, createMemo, type Component, type JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { twCx } from "~/components/utils/twCva";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { NewEntryCard } from "../NewEntryCard";
import { TimeEntryCard } from "../TimeEntryCard";
import {
  createdTimeEntriesKey,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";
import {
  groupIssuesByProject,
  groupTimeEntries,
  sumDayTimeEntriesHours,
  sumDayTimeEntriesMap,
  sumTimeEntriesHoursByDay,
} from "./TimeEntryGrid.utils";

const GridCell: Component<JSX.IntrinsicElements["div"]> = (props) => {
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
      <GridCell class="bg-base-100 sticky left-0 top-0 z-30 flex p-2" />
      <For each={days()}>
        {(day) => (
          <GridCell class="bg-base-100 sticky top-0 z-20 flex flex-col p-2">
            <span class="text-3xl">{dayFormat()(day)}</span>
            <span>{weekdayFormat()(day)}</span>
          </GridCell>
        )}
      </For>
      <GridCell class="bg-base-100 sticky right-0 top-0 z-30 flex border-l-[1px] p-2" />
    </>
  );
};

type CellProps = {
  day: Date;
  entries?: TimeEntry[];
  issue: Issue;
};

const Cell: Component<CellProps> = (props) => {
  const [t] = useI18n();

  const { setCreatedTimeEntries, createdTimeEntries } = useTimeSheetContext();

  const key = () => {
    return createdTimeEntriesKey({
      day: props.day,
      issueId: props.issue.id,
    });
  };

  const created = createMemo(() => {
    return createdTimeEntries.map[key()] || [];
  });

  const onCreateClick = () => {
    const newEntry = {
      comments: "",
      hours: 0,
      issueId: props.issue.id,
      spentOn: props.day,
    };
    setCreatedTimeEntries("map", key(), (current) => [
      ...(current || []),
      newEntry,
    ]);
  };

  return (
    <GridCell class="flex flex-col gap-2 p-2">
      <div>
        <Button onClick={onCreateClick} variant="outline" size="xs">
          {t("dashboard.create")}
        </Button>
      </div>
      <For each={created()}>
        {(args, index) => <NewEntryCard args={args} index={index()} />}
      </For>
      <For each={props.entries}>
        {(entry) => <TimeEntryCard entry={entry} />}
      </For>
    </GridCell>
  );
};

type RowProps = {
  dayEntryMap?: Map<string, TimeEntry[]>;
  issue: Issue;
};

const Row: Component<RowProps> = (props) => {
  const { days } = useTimeSheetContext();

  const hoursSum = createMemo(() => {
    return sumDayTimeEntriesMap(props.dayEntryMap);
  });

  return (
    <>
      <GridCell class="bg-base-100 sticky left-0 z-10 flex w-64">
        <div class="flex flex-col p-2">
          <Badge variant="outline">{props.issue.id}</Badge>
          <span>{props.issue.subject}</span>
        </div>
      </GridCell>
      <For each={days()}>
        {(day) => (
          <Cell
            issue={props.issue}
            day={day}
            entries={props.dayEntryMap?.get(formatRequestDate(day))}
          />
        )}
      </For>
      <GridCell class="bg-base-100 sticky right-0 z-10 flex border-l-[1px]">
        <div class="flex flex-col p-2">
          <span>{hoursSum()}</span>
        </div>
      </GridCell>
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
      <GridCell
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
      </GridCell>
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
      <GridCell class="bg-base-100 sticky bottom-0 left-0 z-30 flex border-t-[1px] p-2" />
      <For each={days()}>
        {(day) => (
          <GridCell class="bg-base-100 sticky bottom-0 z-20 flex flex-col border-t-[1px] p-2">
            <span>{timeEntryDayHoursGroups().get(formatRequestDate(day))}</span>
          </GridCell>
        )}
      </For>
      <GridCell class="bg-base-100 sticky bottom-0 right-0 z-30 flex border-l-[1px] border-t-[1px] p-2">
        {timeEntryHours()}
      </GridCell>
    </>
  );
};

type Props = {
  issues: Issue[];
  timeEntries: TimeEntry[];
};

export const TimeEntryGrid: Component<Props> = (props) => {
  const projectGroups = createMemo(() => groupIssuesByProject(props.issues));
  const timeEntryGroups = createMemo(() => groupTimeEntries(props.timeEntries));

  const { days } = useTimeSheetContext();

  return (
    <div
      class="w-max-[100vw] grid max-h-[80vh] overflow-scroll"
      style={{ "grid-template-columns": `repeat(${days().length + 2}, auto)` }}
    >
      <Header />
      <For each={projectGroups()}>
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