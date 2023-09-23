import { createAutoAnimate } from "@formkit/auto-animate/solid";
import { IoChevronBackSharp, IoChevronForwardSharp } from "solid-icons/io";
import { For, Suspense, createMemo, lazy, type Component } from "solid-js";
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

const CreateEntryMenu = lazy(() =>
  import("./CreateEntryMenu").then((module) => ({
    default: module.CreateEntryMenu,
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
        <CreateEntryMenu date={props.date} />
      </Suspense>
    </GridCell>
  );
};

type HeaderProps = {
  days: Date[];
};

export const Header: Component<HeaderProps> = (props) => {
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
        {(entry) => (
          <CreatedEntryCard entry={entry} issueId={entry.args.issueId} />
        )}
      </For>
      <For each={props.timeEntries}>
        {(entry) => <UpdatedEntryCard entry={entry} issueId={entry.issue.id} />}
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

const ScrollButtons: Component = () => {
  const onBackClick = () => {
    window.scrollBy({ behavior: "smooth", left: -scrollShift });
  };

  const onForwardClick = () => {
    window.scrollBy({ behavior: "smooth", left: scrollShift });
  };

  return (
    <div class="sticky left-0 max-w-[100vw]">
      <Button
        class="absolute left-2 top-[calc(-1*calc(100vh/2))] hidden bg-base-100 sm:block"
        onClick={onBackClick}
        size="sm"
        variant="outline"
      >
        <IoChevronBackSharp />
      </Button>
      <Button
        class="absolute right-2 top-[calc(-1*calc(100vh/2))] hidden bg-base-100 sm:block"
        onClick={onForwardClick}
        size="sm"
        variant="outline"
      >
        <IoChevronForwardSharp />
      </Button>
    </div>
  );
};

type EntryGridProps = {
  days: Date[];
  selectedDate: Date;
  timeEntries: TimeEntry[];
};

export const TimeEntryGrid: Component<EntryGridProps> = (props) => {
  const timeEntryGroups = createMemo(() => groupTimeEntries(props.timeEntries));

  return (
    <TimeSheetContextProvider timeEntries={props.timeEntries}>
      <div
        class="relative grid h-full"
        style={{ "grid-template-rows": "auto 1fr" }}
      >
        <TableToolbar />
        <div
          class="relative grid"
          style={{
            "grid-template-columns": `repeat(${props.days.length}, ${scrollShift}px) auto`,
            "grid-template-rows": "auto 1fr auto",
          }}
        >
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
        </div>
        <ScrollButtons />
      </div>
    </TimeSheetContextProvider>
  );
};
