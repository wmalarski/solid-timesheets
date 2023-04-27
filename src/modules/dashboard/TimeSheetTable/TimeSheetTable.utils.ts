import { createMemo } from "solid-js";
import { useSearchParams } from "solid-start";
import { z } from "zod";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { formatRequestDate } from "~/utils/format";

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

export const getDaysInMonth = (start: Date) => {
  const date = new Date(start);
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCDate(0);

  return Array(date.getUTCDate())
    .fill(0)
    .map((_, index) => {
      const entry = new Date(start);
      entry.setUTCDate(index + 1);
      return entry;
    });
};

const defaultDate = new Date();
defaultDate.setUTCDate(1);

const paramsSchema = z.object({
  date: z.coerce.date().default(defaultDate),
  hidden: z
    .string()
    .regex(/^(\d{1,},?)*$/)
    .default("")
    .transform((arg) =>
      arg
        .split(",")
        .filter((entry) => entry.length > 0)
        .map((entry) => +entry)
    ),
});

const defaultParams: Required<z.infer<typeof paramsSchema>> = {
  date: defaultDate,
  hidden: [],
};

export const useTimeSheetSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = createMemo(() => {
    const parsed = paramsSchema.safeParse({
      date: searchParams.date,
      hidden: searchParams.hidden,
    });
    return parsed.success ? parsed.data : defaultParams;
  });

  const hideProject = (projectId: number) => {
    const current = params();
    setSearchParams({
      hidden: current.hidden.filter((id) => id !== projectId).join(","),
    });
  };

  const showProject = (projectId: number) => {
    const current = params();
    setSearchParams({
      hidden: [...current.hidden, projectId].join(","),
    });
  };

  const toggleProject = (projectId: number) => {
    const current = params();
    const hasProjectId = current.hidden.includes(projectId);
    setSearchParams({
      hidden: hasProjectId
        ? current.hidden.filter((id) => id !== projectId).join(",")
        : [...current.hidden, projectId].join(","),
    });
  };

  const setMonth = (date: Date) => {
    setSearchParams({ date: formatRequestDate(date) });
  };

  const setPreviousMonth = () => {
    const current = params();
    const date = new Date(current.date || defaultDate);
    date.setUTCMonth(date.getUTCMonth() - 1);
    setMonth(date);
  };

  const setNextMonth = () => {
    const current = params();
    const date = new Date(current.date || defaultDate);
    date.setUTCMonth(date.getUTCMonth() + 1);
    setMonth(date);
  };

  return {
    hideProject,
    params,
    setMonth,
    setNextMonth,
    setPreviousMonth,
    showProject,
    toggleProject,
  };
};
