import { useI18n } from "@solid-primitives/i18n";
import { For, createMemo, type Component, type JSX } from "solid-js";
import { twCx } from "~/components/utils/twCva";
import type { Issue, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";
import { CreatedEntryCard } from "../CreatedEntryCard";
import {
  sheetEntryMapKey,
  useTimeSheetConfig,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";
import { UpdatedEntryCard } from "../UpdatedEntryCard";
import { CreateEntryMenu } from "./CreateEntryMenu";
import { TableToolbar } from "./TableToolbar";
import {
  groupIssues,
  groupTimeEntries,
  sumDayTimeEntriesHours,
  sumTimeEntriesHoursByDay,
  type IssueTimeEntryPair,
} from "./TimeEntryGrid.utils";

const GridCell: Component<JSX.IntrinsicElements["div"]> = (props) => {
  return (
    <div
      {...props}
      class={twCx("border-b-[1px] border-r-[1px] border-gray-300", props.class)}
    />
  );
};

type HeaderProps = {
  issues: Issue[];
};

const Header: Component<HeaderProps> = (props) => {
  const [, { locale }] = useI18n();

  const { days } = useTimeSheetConfig();

  const dayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { day: "numeric" }).format;
  });

  const weekdayFormat = createMemo(() => {
    return Intl.DateTimeFormat(locale(), { weekday: "long" }).format;
  });

  return (
    <>
      <For each={days()}>
        {(date) => (
          <GridCell class="bg-base-100 sticky top-0 z-20 flex items-center justify-between gap-2 p-2">
            <div class="flex flex-col ">
              <span class="text-3xl">{dayFormat()(date)}</span>
              <span>{weekdayFormat()(date)}</span>
            </div>
            <CreateEntryMenu date={date} issues={props.issues} />
          </GridCell>
        )}
      </For>
      <GridCell class="bg-base-100 sticky right-0 top-0 z-30 flex border-l-[1px] p-2" />
    </>
  );
};

type CellProps = {
  date: Date;
  issuesMap: Map<number, Issue>;
  pairs?: IssueTimeEntryPair[];
};

const Cell: Component<CellProps> = (props) => {
  const { state } = useTimeSheetContext();

  const created = createMemo(() => {
    const key = sheetEntryMapKey({ date: props.date });
    const entries = Object.values(state.dateMap[key] || {});
    return entries.flatMap((entry) => {
      if (!entry) {
        return [];
      }

      const issue = props.issuesMap.get(entry.args.issueId);
      if (!issue) {
        return [];
      }

      return [{ entry, issue }];
    });
  });

  return (
    <GridCell class="flex flex-col gap-2 p-2">
      <For each={created()}>
        {(pair) => <CreatedEntryCard entry={pair.entry} issue={pair.issue} />}
      </For>
      <For each={props.pairs}>
        {(pair) => <UpdatedEntryCard entry={pair.entry} issue={pair.issue} />}
      </For>
    </GridCell>
  );
};

type FooterProps = {
  timeEntries: TimeEntry[];
};

const Footer: Component<FooterProps> = (props) => {
  const { days } = useTimeSheetConfig();

  const timeEntryDayHoursGroups = createMemo(() => {
    return sumTimeEntriesHoursByDay(props.timeEntries);
  });

  const timeEntryHours = createMemo(() => {
    return sumDayTimeEntriesHours(props.timeEntries);
  });

  return (
    <>
      <For each={days()}>
        {(day) => (
          <GridCell class="bg-base-100 sticky bottom-0 z-20 flex flex-col border-t-[1px] p-2">
            <span class="font-semibold">
              {timeEntryDayHoursGroups().get(formatRequestDate(day))}
            </span>
          </GridCell>
        )}
      </For>
      <GridCell class="bg-base-100 sticky bottom-0 right-0 z-30 flex border-l-[1px] border-t-[1px] p-2">
        <span class="font-bold">{timeEntryHours()}</span>
      </GridCell>
    </>
  );
};

type Props = {
  issues: Issue[];
  timeEntries: TimeEntry[];
};

export const TimeEntryGrid: Component<Props> = (props) => {
  const issuesMap = createMemo(() => groupIssues(props.issues));

  const timeEntryGroups = createMemo(() =>
    groupTimeEntries({
      entries: props.timeEntries,
      issuesMap: issuesMap(),
    })
  );

  const { days } = useTimeSheetConfig();

  return (
    <div class="flex grow flex-col">
      <TableToolbar />
      <div
        class="w-max-[100vw] grid grow overflow-scroll"
        style={{
          "grid-template-columns": `repeat(${days().length}, 250px) auto`,
          "grid-template-rows": "auto 1fr auto",
        }}
      >
        <Header issues={props.issues} />
        <For each={days()}>
          {(day) => (
            <Cell
              date={day}
              issuesMap={issuesMap()}
              pairs={timeEntryGroups().get(formatRequestDate(day))}
            />
          )}
        </For>
        <GridCell class="bg-base-100 sticky bottom-0 right-0 z-30 flex border-l-[1px] p-2" />
        <Footer timeEntries={props.timeEntries} />
      </div>
    </div>
  );
};
