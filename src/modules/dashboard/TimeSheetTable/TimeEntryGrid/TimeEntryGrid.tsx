import { createAutoAnimate } from "@formkit/auto-animate/solid";
import { createQuery, isServer } from "@tanstack/solid-query";
import { IoChevronBackSharp, IoChevronForwardSharp } from "solid-icons/io";
import { For, Show, createMemo, createSignal, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { GridCell } from "~/components/Grid";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
  type GetTimeEntriesArgs,
} from "~/server/timeEntries";
import type { Issue, TimeEntry } from "~/server/types";
import { isToday } from "~/utils/date";
import { formatDay, formatRequestDate, formatWeekday } from "~/utils/format";
import { CreatedEntryCard } from "../CreatedEntryCard";
import { sheetEntryMapKey, useTimeSheetContext } from "../EntriesStore";
import { UpdatedEntryCard } from "../UpdatedEntryCard";
import { CreateEntryMenu } from "./CreateEntryMenu";
import {
  groupIssues,
  groupTimeEntries,
  sumDayTimeEntriesHours,
  sumTimeEntriesHoursByDay,
  type IssueTimeEntryPair,
} from "./TimeEntryGrid.utils";

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
      {/* <CreateEntryDialog date={props.date} issues={props.issues} /> */}
      <CreateEntryMenu date={props.date} />
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
  issuesMap: Map<number, Issue>;
  pairs?: IssueTimeEntryPair[];
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
          <Show when={entry && props.issuesMap.get(entry.args.issueId)}>
            {(issue) => <CreatedEntryCard entry={entry} issue={issue()} />}
          </Show>
        )}
      </For>
      <For each={props.pairs}>
        {(pair) => <UpdatedEntryCard entry={pair.entry} issue={pair.issue} />}
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

type ScrollButtonsProps = {
  parent?: HTMLDivElement;
};

const scrollShift = 250;

const ScrollButtons: Component<ScrollButtonsProps> = (props) => {
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

type EntryGridProps = {
  days: Date[];
  issues: Issue[];
  timeEntries: TimeEntry[];
};

const EntryGrid: Component<EntryGridProps> = (props) => {
  const [parent, setParent] = createSignal<HTMLDivElement>();

  const issuesMap = createMemo(() => groupIssues(props.issues));

  const timeEntryGroups = createMemo(() =>
    groupTimeEntries({
      entries: props.timeEntries,
      issuesMap: issuesMap(),
    })
  );

  return (
    <div
      class="w-max-[100vw] grid grow snap-x overflow-scroll"
      ref={setParent}
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
            issuesMap={issuesMap()}
            pairs={timeEntryGroups().get(formatRequestDate(day))}
          />
        )}
      </For>
      <For each={props.days}>
        {(day) => <Cell date={day} issuesMap={new Map()} pairs={[]} />}
      </For>
      <GridCell bg="base-100" />
      <Footer days={props.days} timeEntries={props.timeEntries} />
      <ScrollButtons parent={parent()} />
    </div>
  );
};

type Props = {
  args: GetTimeEntriesArgs;
  days: Date[];
};

export const TimeEntryGrid: Component<Props> = (props) => {
  const timeEntriesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(props.args),
  }));

  const issuesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
  }));

  return (
    <EntryGrid
      days={props.days}
      issues={issuesQuery.data?.issues || []}
      timeEntries={timeEntriesQuery.data?.time_entries || []}
    />
  );
};
