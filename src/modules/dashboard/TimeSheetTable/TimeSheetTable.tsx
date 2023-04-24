import { createQuery } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";

export const TimeSheetTable: Component = () => {
  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey({}),
    suspense: true,
  }));

  return <pre>{JSON.stringify(timeEntriesQuery.data, null, 2)}</pre>;
};
