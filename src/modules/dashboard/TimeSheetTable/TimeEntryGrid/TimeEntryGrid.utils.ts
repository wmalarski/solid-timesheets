import type { Issue, Project, TimeEntry } from "~/server/types";

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

export const groupTimeEntries = (entries: TimeEntry[]) => {
  const map = new Map<number, Map<number, Map<string, TimeEntry[]>>>();
  const fallbackProjectMap = () => new Map<number, Map<string, TimeEntry[]>>();
  const fallbackIssueMap = () => new Map<string, TimeEntry[]>();
  const fallbackDayArray = () => new Array<TimeEntry>();

  entries.forEach((entry) => {
    const project = getOrSetDefault(map, entry.project.id, fallbackProjectMap);
    const issue = getOrSetDefault(project, entry.issue.id, fallbackIssueMap);
    const day = getOrSetDefault(issue, entry.spent_on, fallbackDayArray);

    day.push(entry);
  });

  return map;
};

export const groupIssuesByProject = (issues: Issue[]) => {
  const projectMap = new Map<number, Project>();
  const map = new Map<number, Issue[]>();

  const fallbackArray = () => new Array<Issue>();

  issues.forEach((issue) => {
    const project = getOrSetDefault(map, issue.project.id, fallbackArray);

    projectMap.set(issue.project.id, issue.project);
    project.push(issue);
  });

  return Array.from(projectMap.values()).map((project) => ({
    issues: map.get(project.id) || [],
    project,
  }));
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
