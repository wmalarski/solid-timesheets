import { createQuery } from "@tanstack/solid-query";
import { createEffect, createMemo, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
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

  const issuesQuery = createQuery(() => ({
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({}),
    suspense: true,
  }));

  createEffect(() => {
    console.log("====groups===", groups());
  });

  return <pre>{JSON.stringify(issuesQuery.data, null, 2)}</pre>;
};
