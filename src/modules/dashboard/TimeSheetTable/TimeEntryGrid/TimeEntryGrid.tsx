import { useI18n } from "@solid-primitives/i18n";
import { IoChevronBackSharp, IoChevronForwardSharp } from "solid-icons/io";
import {
  For,
  createEffect,
  createMemo,
  createSignal,
  type Component,
} from "solid-js";
import { Button } from "~/components/Button";
import { GridCell } from "~/components/Grid";
import type { Issue, TimeEntry } from "~/server/types";
import { isToday } from "~/utils/date";
import { formatDay, formatRequestDate, formatWeekday } from "~/utils/format";
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

type HeaderCellProps = {
  date: Date;
  issues: Issue[];
};

const HeaderCell: Component<HeaderCellProps> = (props) => {
  const [, { locale }] = useI18n();

  const [ref, setRef] = createSignal<HTMLDivElement>();

  const isDateToday = createMemo(() => {
    return isToday(props.date);
  });

  createEffect(() => {
    if (isDateToday()) {
      ref()?.scrollIntoView({ block: "center" });
    }
  });

  return (
    <GridCell
      bg={isDateToday() ? "base-200" : "base-100"}
      ref={setRef}
      class="z-20 flex items-center justify-between gap-2"
      sticky="top"
      borders="bottomRight"
    >
      <div class="flex flex-col">
        <span class="text-3xl">
          {formatDay({ date: props.date, locale: locale() })}
        </span>
        <span>{formatWeekday({ date: props.date, locale: locale() })}</span>
      </div>
      <CreateEntryMenu date={props.date} issues={props.issues} />
    </GridCell>
  );
};

type HeaderProps = {
  issues: Issue[];
};

const Header: Component<HeaderProps> = (props) => {
  const { days } = useTimeSheetConfig();

  return (
    <>
      <For each={days()}>
        {(date) => <HeaderCell date={date} issues={props.issues} />}
      </For>
      <GridCell bg="base-100" borders="bottom" sticky="top" />
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
    <GridCell borders="right" class="flex flex-col gap-2">
      <For each={created()}>
        {(pair) => <CreatedEntryCard entry={pair.entry} issue={pair.issue} />}
      </For>
      <For each={props.pairs}>
        {(pair) => <UpdatedEntryCard entry={pair.entry} issue={pair.issue} />}
      </For>
    </GridCell>
  );
};

type ScrollButtonsProps = {
  parent?: HTMLDivElement;
};

const ScrollButtons: Component<ScrollButtonsProps> = (props) => {
  const scrollShift = 300;

  const onBackClick = () => {
    props.parent?.scrollBy({ behavior: "smooth", left: -scrollShift });
  };

  const onForwardClick = () => {
    props.parent?.scrollBy({ behavior: "smooth", left: scrollShift });
  };

  return (
    <>
      <Button
        class="absolute left-2 top-2/4 hidden bg-base-100 sm:block"
        onClick={onBackClick}
        size="sm"
        variant="outline"
      >
        <IoChevronBackSharp />
      </Button>
      <Button
        class="absolute right-2 top-2/4 hidden bg-base-100 sm:block"
        onClick={onForwardClick}
        size="sm"
        variant="outline"
      >
        <IoChevronForwardSharp />
      </Button>
    </>
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
        {(date) => (
          <GridCell
            bg="base-100"
            borders="topLeft"
            class="z-20"
            sticky="bottom"
          >
            <span class="font-semibold">
              {timeEntryDayHoursGroups().get(formatRequestDate(date)) || 0}
            </span>
          </GridCell>
        )}
      </For>
      <GridCell
        bg="base-100"
        borders="topLeft"
        class="z-30"
        sticky="bottomRight"
      >
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
  const [parent, setParent] = createSignal<HTMLDivElement>();

  const issuesMap = createMemo(() => groupIssues(props.issues));

  const timeEntryGroups = createMemo(() =>
    groupTimeEntries({
      entries: props.timeEntries,
      issuesMap: issuesMap(),
    })
  );

  const { days } = useTimeSheetConfig();

  return (
    <div class="relative flex grow flex-col" ref={setParent}>
      <TableToolbar />
      <div
        class="w-max-[100vw] grid grow overflow-scroll"
        ref={setParent}
        style={{
          "grid-template-columns": `repeat(${days().length}, 250px) auto`,
          "grid-template-rows": "auto 1fr auto",
          "max-height": "calc(100vh - 114px)",
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
        <GridCell bg="base-100" />
        <Footer timeEntries={props.timeEntries} />
      </div>
      <ScrollButtons parent={parent()} />
    </div>
  );
};
