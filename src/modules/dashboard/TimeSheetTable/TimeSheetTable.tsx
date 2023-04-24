import { createQuery } from "@tanstack/solid-query";
import { createEffect, createMemo, type Component } from "solid-js";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import { groupTimeEntries } from "./TimeSheetTable.utils";

export const TimeSheetTable: Component = () => {
  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey({}),
    suspense: true,
  }));

  const groups = createMemo(() =>
    groupTimeEntries(timeEntriesQuery.data?.time_entries || [])
  );

  createEffect(() => {
    console.log("====groups===", groups());
  });

  return <pre>{JSON.stringify(timeEntriesQuery.data, null, 2)}</pre>;
};
