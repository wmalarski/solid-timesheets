import type { Issue, IssueEssentials, TimeEntry } from "~/server/types";
import type { CreatingEntryData, UpdatingEntryData } from "../EntriesStore";

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
  issue: IssueEssentials;
};

export const groupTimeEntries = ({
  entries,
  issuesMap,
}: GroupTimeEntriesArgs) => {
  const dayMap = new Map<string, IssueTimeEntryPair[]>();
  const fallbackDayArray = () => new Array<IssueTimeEntryPair>();

  entries.forEach((entry) => {
    const issue = issuesMap.get(entry.issue.id);

    const essentials = issue || {
      id: entry.issue.id,
      project: entry.project,
      subject: String(entry.issue.id),
    };

    const day = getOrSetDefault(dayMap, entry.spent_on, fallbackDayArray);
    day.push({ entry, issue: essentials });
  });

  return dayMap;
};

type SumTimeEntriesHoursByDayArgs = {
  dateMap: Record<string, Record<number, CreatingEntryData | undefined>>;
  timeEntries: TimeEntry[];
  updateMap: Record<number, UpdatingEntryData | undefined>;
};

export const sumTimeEntriesHoursByDay = ({
  dateMap,
  timeEntries,
  updateMap,
}: SumTimeEntriesHoursByDayArgs) => {
  const map = new Map<string, number[]>();
  const fallbackArray = () => new Array<number>();

  timeEntries.forEach((entry) => {
    const value = getOrSetDefault(map, entry.spent_on, fallbackArray);

    const updated = updateMap[entry.id];
    const hours = updated?.args.hours ?? entry.hours;

    value.push(hours);
  });

  Object.entries(dateMap).forEach(([date, entries]) => {
    const value = getOrSetDefault(map, date, fallbackArray);

    Object.values(entries).forEach((entry) => {
      if (entry) {
        value.push(entry.args.hours);
      }
    });
  });

  return map;
};

export const sumDayTimeEntriesHours = (map: Map<string, number[]>) => {
  return (
    new Array(...map.values()).flat().reduce((prev, curr) => prev + curr, 0) ||
    0
  );
};
