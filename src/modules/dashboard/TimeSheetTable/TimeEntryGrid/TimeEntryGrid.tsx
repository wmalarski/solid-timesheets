import { createAutoAnimate } from "@formkit/auto-animate/solid";
import { IoChevronBackSharp, IoChevronForwardSharp } from "solid-icons/io";
import {
  For,
  Show,
  Suspense,
  createMemo,
  createSignal,
  lazy,
  type Component,
} from "solid-js";
import { Button } from "~/components/Button";
import { GridCell } from "~/components/Grid";
import type { TimeEntry } from "~/server/types";
import { isToday } from "~/utils/date";
import { formatDay, formatRequestDate, formatWeekday } from "~/utils/format";
import { CreatedEntryCard } from "../CreatedEntryCard";
import {
  TimeSheetContextProvider,
  sheetEntryMapKey,
  useTimeSheetContext,
} from "../EntriesStore";
import { UpdatedEntryCard } from "../UpdatedEntryCard";
import { TableToolbar } from "./TableToolbar";
import {
  groupTimeEntries,
  sumDayTimeEntriesHours,
  sumTimeEntriesHoursByDay,
} from "./TimeEntryGrid.utils";

const CreateIssueDialog = lazy(() =>
  import("../IssuesDialog").then((module) => ({
    default: module.CreateIssueDialog,
  }))
);

type HeaderCellProps = {
  date: Date;
};

const HeaderCell: Component<HeaderCellProps> = (props) => {
  const isDateToday = createMemo(() => {
    return isToday(props.date);
  });

  return (
    <GridCell
      bg={isDateToday() ? "base-200" : "base-100"}
      class="z-20 flex snap-mandatory snap-start items-center justify-between gap-2"
      sticky="top"
      borders="bottomRight"
    >
      <div class="flex flex-col">
        <span class="text-3xl">{formatDay(props.date)}</span>
        <span>{formatWeekday(props.date)}</span>
      </div>
      <Suspense>
        <CreateIssueDialog date={props.date} />
      </Suspense>
    </GridCell>
  );
};

type HeaderProps = {
  days: Date[];
};

const Header: Component<HeaderProps> = (props) => {
  return (
    <>
      <For each={props.days}>{(date) => <HeaderCell date={date} />}</For>
      <GridCell bg="base-100" borders="bottom" sticky="top" />
    </>
  );
};

type CellProps = {
  date: Date;
  timeEntries?: TimeEntry[];
};

const Cell: Component<CellProps> = (props) => {
  const { state } = useTimeSheetContext();

  const [setParent] = createAutoAnimate();

  const created = createMemo(() => {
    const key = sheetEntryMapKey({ date: props.date });
    const entries = Object.values(state.dateMap[key] || {});
    return entries.flatMap((entry) => (entry ? [entry] : [])).reverse();
  });

  return (
    <GridCell ref={setParent} borders="right" class="flex flex-col gap-2">
      <For each={created()}>
        {(entry) => <CreatedEntryCard entry={entry} />}
      </For>
      <For each={props.timeEntries}>
        {(entry) => <UpdatedEntryCard entry={entry} />}
      </For>
    </GridCell>
  );
};

type FooterCellProps = {
  hours?: number[];
};

const FooterCell: Component<FooterCellProps> = (props) => {
  const sum = () => {
    return props.hours?.reduce((prev, curr) => prev + curr, 0) || 0;
  };

  const details = () => {
    if (!props.hours || props.hours.length < 1) {
      return null;
    }
    return `(${props.hours.join("+")})`;
  };

  return (
    <GridCell
      bg="base-100"
      borders="topLeft"
      class="z-20 flex items-center gap-1"
      sticky="bottom"
    >
      <span class="font-semibold">{sum()}</span>
      <span class="truncate text-xs">{details()}</span>
    </GridCell>
  );
};

type FooterProps = {
  days: Date[];
  timeEntries: TimeEntry[];
};

const Footer: Component<FooterProps> = (props) => {
  const { state } = useTimeSheetContext();

  const timeEntryDayHoursGroups = createMemo(() => {
    return sumTimeEntriesHoursByDay({
      dateMap: state.dateMap,
      timeEntries: props.timeEntries,
      updateMap: state.updateMap,
    });
  });

  const timeEntryHours = createMemo(() => {
    return sumDayTimeEntriesHours(timeEntryDayHoursGroups());
  });

  return (
    <>
      <For each={props.days}>
        {(date) => (
          <FooterCell
            hours={timeEntryDayHoursGroups().get(formatRequestDate(date))}
          />
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

const scrollShift = 250;

type ScrollButtonsProps = {
  parent: HTMLDivElement;
};

const ScrollButtons: Component<ScrollButtonsProps> = (props) => {
  const onBackClick = () => {
    props.parent.scrollBy({ behavior: "smooth", left: -scrollShift });
  };

  const onForwardClick = () => {
    props.parent.scrollBy({ behavior: "smooth", left: scrollShift });
  };

  return (
    <>
      <Button
        class="absolute left-2 top-1/2 hidden bg-base-100 sm:block"
        onClick={onBackClick}
        size="sm"
        variant="outline"
      >
        <IoChevronBackSharp />
      </Button>
      <Button
        class="absolute right-2 top-1/2 hidden bg-base-100 sm:block"
        onClick={onForwardClick}
        size="sm"
        variant="outline"
      >
        <IoChevronForwardSharp />
      </Button>
    </>
  );
};

type EntryGridProps = {
  days: Date[];
  timeEntries: TimeEntry[];
};

const EntryGrid: Component<EntryGridProps> = (props) => {
  const timeEntryGroups = createMemo(() => groupTimeEntries(props.timeEntries));

  return (
    <TimeSheetContextProvider timeEntries={props.timeEntries}>
      <TableToolbar daysCont={props.days.length} />
      <Header days={props.days} />
      <For each={props.days}>
        {(day) => (
          <Cell
            date={day}
            timeEntries={timeEntryGroups().get(formatRequestDate(day))}
          />
        )}
      </For>
      <GridCell bg="base-100" />
      <Footer days={props.days} timeEntries={props.timeEntries} />
    </TimeSheetContextProvider>
  );
};

type TimeEntryGridProps = {
  days: Date[];
  selectedDate: Date;
  timeEntries: TimeEntry[];
};

export const TimeEntryGrid: Component<TimeEntryGridProps> = (props) => {
  const [parent, setParent] = createSignal<HTMLDivElement>();

  return (
    <div
      class="grid max-w-[100vw] overflow-hidden"
      style={{ "grid-template-rows": "auto 1fr" }}
    >
      <div
        class="relative grid min-h-[calc(100vh-75px)] overflow-scroll"
        ref={setParent}
        style={{
          "grid-template-columns": `repeat(${props.days.length}, ${scrollShift}px) auto`,
          "grid-template-rows": "auto auto 1fr auto",
        }}
      >
        <Suspense fallback={<EntryGrid days={props.days} timeEntries={[]} />}>
          <EntryGrid days={props.days} timeEntries={props.timeEntries} />
        </Suspense>
      </div>
      <Show when={parent()}>
        {(parent) => <ScrollButtons parent={parent()} />}
      </Show>
    </div>
  );
};
