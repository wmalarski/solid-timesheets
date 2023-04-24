import type { Project, TimeEntry } from "~/server/types";

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
  const projectMap = new Map<number, Project>();

  const map = new Map<number, Map<number, Map<string, TimeEntry[]>>>();
  const fallbackProjectMap = () => new Map<number, Map<string, TimeEntry[]>>();
  const fallbackIssueMap = () => new Map<string, TimeEntry[]>();
  const fallbackDayArray = () => new Array<TimeEntry>();

  entries.forEach((entry) => {
    const project = getOrSetDefault(map, entry.project.id, fallbackProjectMap);
    const issue = getOrSetDefault(project, entry.issue.id, fallbackIssueMap);
    const day = getOrSetDefault(issue, entry.spent_on, fallbackDayArray);

    projectMap.set(entry.project.id, entry.project);
    day.push(entry);
  });

  return Array.from(projectMap.values()).map((project) => ({
    issues: map.get(project.id) || fallbackProjectMap(),
    project,
  }));
};
