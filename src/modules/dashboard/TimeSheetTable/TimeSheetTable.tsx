import { createQuery } from "@tanstack/solid-query";
import { IoChevronBackSharp, IoChevronForwardSharp } from "solid-icons/io";
import { createMemo, createSignal, type Component, type JSX } from "solid-js";
import { isServer } from "solid-js/web";
import { Button } from "~/components/Button";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import { getDaysInMonth, getNextMonth } from "~/utils/date";
import { TimeSheetContextProvider } from "./EntriesStore";
import { TimeEntryGrid } from "./TimeEntryGrid";
import { TableToolbar } from "./TimeEntryGrid/TableToolbar";
import { useTimeSheetSearchParams } from "./TimeSheetTable.utils";
import { TrackingStoreProvider } from "./TrackingStore";

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

type ScrollContainerProps = {
  children: JSX.Element;
  days: Date[];
};

const ScrollContainer: Component<ScrollContainerProps> = (props) => {
  const [parent, setParent] = createSignal<HTMLDivElement>();

  // createEffect(() => {
  //   const date = new Date();
  //   const dayOfMonth = date.getUTCDate();
  //   parent()?.scrollBy({ left: scrollShift * (dayOfMonth - 1) });
  // });

  return (
    <>
      <div class="w-max-[100vw] overflow-scroll" ref={setParent}>
        <div
          class="grid grow snap-x"
          style={{
            "grid-template-columns": `repeat(${props.days.length}, ${scrollShift}px) auto`,
            "grid-template-rows": "auto 1fr auto",
            "max-height": "calc(100vh - 114px)",
            width: `${props.days.length * scrollShift}px`,
          }}
        >
          {props.children}
        </div>
      </div>
      <ScrollButtons parent={parent()} />
    </>
  );
};

export const TimeSheetTable: Component = () => {
  const { selectedDate } = useTimeSheetSearchParams();
  const days = createMemo(() => getDaysInMonth(selectedDate()));

  const timeEntriesArgs = () => {
    const from = selectedDate();
    const to = getNextMonth(from);
    return { from, limit: 100, to };
  };

  const timeEntriesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey(timeEntriesArgs()),
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
    <TrackingStoreProvider>
      <TimeSheetContextProvider
        timeEntries={timeEntriesQuery.data?.time_entries || []}
      >
        <div class="relative flex grow flex-col">
          <TableToolbar issues={issuesQuery.data?.issues || []} />
          <ScrollContainer days={days()}>
            <TimeEntryGrid
              issues={issuesQuery.data?.issues || []}
              timeEntries={timeEntriesQuery.data?.time_entries || []}
            />
          </ScrollContainer>
        </div>
      </TimeSheetContextProvider>
    </TrackingStoreProvider>
  );
};
