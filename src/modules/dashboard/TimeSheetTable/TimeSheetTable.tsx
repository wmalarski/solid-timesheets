import { createQuery } from "@tanstack/solid-query";
import { For, createEffect, createMemo, type Component } from "solid-js";
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import {
  getTimeEntriesKey,
  getTimeEntriesServerQuery,
} from "~/server/timeEntries";
import {
  getDaysInMonth,
  groupIssues,
  groupTimeEntries,
} from "./TimeSheetTable.utils";

export const TimeSheetTable: Component = () => {
  const timeEntriesQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntriesServerQuery(context.queryKey),
    queryKey: getTimeEntriesKey({}),
    suspense: true,
  }));

  const timeEntryGroups = createMemo(() =>
    groupTimeEntries(timeEntriesQuery.data?.time_entries || [])
  );

  const issuesQuery = createQuery(() => ({
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
    suspense: true,
  }));

  const projectGroups = createMemo(() =>
    groupIssues(issuesQuery.data?.issues || [])
  );

  const days = createMemo(() => getDaysInMonth(new Date()));

  createEffect(() => {
    console.log("====groups===", timeEntryGroups());
    console.log("====days===", days());
  });

  return (
    <div>
      <pre>{JSON.stringify(days(), null, 2)}</pre>
      <For each={projectGroups()}>
        {(projectGroup) => (
          <div class="border-2 border-gray-800 p-4">
            <pre>{JSON.stringify(projectGroup.project, null, 2)}</pre>
            <For each={projectGroup.issues}>
              {(issue) => (
                <div class="border-2 border-gray-800 p-4">
                  <pre>{JSON.stringify(issue, null, 2)}</pre>
                  <For each={days()}>
                    {(day) => (
                      <div class="border-2 border-gray-800 p-4">
                        <pre>{JSON.stringify(day, null, 2)}</pre>
                        <pre>
                          {JSON.stringify(
                            timeEntryGroups()
                              .get(projectGroup.project.id)
                              ?.get(issue.id)
                              ?.get(day),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};
