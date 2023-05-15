import type { Issue, TimeEntry } from "~/server/types";

const getOrSetDefault = <K, V>(
  map: Map<K, V>,
  key: K,
  fallback: () => V
): V => {
  const value = map.get(key);
  if (value !== undefined) {
    return value;
  }
  const newValue = fallback();
  map.set(key, newValue);
  return newValue;
};

export const groupIssues = (issues: Issue[]) => {
  return new Map(issues.map((issue) => [issue.id, issue]));
};

type GroupTimeEntriesArgs = {
  entries: TimeEntry[];
  issuesMap: Map<number, Issue>;
};

export type IssueTimeEntryPair = {
  entry: TimeEntry;
  issue: Issue;
};

export const groupTimeEntries = ({
  entries,
  issuesMap,
}: GroupTimeEntriesArgs) => {
  const dayMap = new Map<string, IssueTimeEntryPair[]>();
  const fallbackDayArray = () => new Array<IssueTimeEntryPair>();

  entries.forEach((entry) => {
    const issue = issuesMap.get(entry.issue.id);
    if (!issue) {
      return;
    }

    const day = getOrSetDefault(dayMap, entry.spent_on, fallbackDayArray);
    day.push({ entry, issue });
  });

  return dayMap;
};

export const sumTimeEntriesHoursByDay = (timeEntries: TimeEntry[]) => {
  const map = new Map<string, number>();

  timeEntries.forEach((entry) => {
    const value = map.get(entry.spent_on) || 0;
    map.set(entry.spent_on, entry.hours + value);
  });

  return map;
};

export const sumDayTimeEntriesHours = (timeEntries: TimeEntry[]) => {
  return timeEntries.reduce((prev, curr) => prev + curr.hours, 0);
};

export const sumDayTimeEntriesMap = (
  dayEntryMap?: Map<string, TimeEntry[]>
) => {
  return sumDayTimeEntriesHours(
    Array.from(dayEntryMap?.values() || []).flatMap((group) => group)
  );
};
