import { createMemo, type Component } from "solid-js";
import { getDaysInMonth, getNextMonth } from "~/utils/date";
import { TimeSheetContextProvider } from "./EntriesStore";
import { TimeEntryGrid } from "./TimeEntryGrid";
import { TableToolbar } from "./TimeEntryGrid/TableToolbar";
import { useTimeSheetSearchParams } from "./TimeSheetTable.utils";
import { TrackingStoreProvider } from "./TrackingStore";

export const TimeSheetTable: Component = () => {
  const { selectedDate } = useTimeSheetSearchParams();
  const days = createMemo(() => getDaysInMonth(selectedDate()));

  const timeEntriesArgs = createMemo(() => {
    const from = selectedDate();
    const to = getNextMonth(from);
    return { from, limit: 100, to };
  });

  return (
    <TrackingStoreProvider>
      <TimeSheetContextProvider args={timeEntriesArgs()}>
        <div
          class="relative grid h-full"
          style={{ "grid-template-rows": "auto 1fr" }}
        >
          <TableToolbar />
          <TimeEntryGrid days={days()} args={timeEntriesArgs()} />
        </div>
      </TimeSheetContextProvider>
    </TrackingStoreProvider>
  );
};
