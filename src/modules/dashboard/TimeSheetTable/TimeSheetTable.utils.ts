import { createEffect, createMemo } from "solid-js";
import { useSearchParams } from "solid-start";
import { z } from "zod";
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

export const groupIssues = (issues: Issue[]) => {
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

export const getDaysInMonth = (start: Date) => {
  const date = new Date(start);
  date.setMonth(date.getMonth() + 1);
  date.setUTCDate(0);

  return Array(date.getUTCDate())
    .fill(0)
    .map((_, index) => {
      const entry = new Date(start);
      entry.setUTCDate(index + 1);
      return entry;
    });
};

const formatDateToSearch = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
};

const defaultDate = new Date();
const defaultMonth = formatDateToSearch(defaultDate);

const paramsSchema = z.object({
  expanded: z
    .string()
    .regex(/^(\d{1,},?)+$/)
    .optional()
    .transform((arg) => arg?.split(",").map((entry) => +entry)),
  month: z
    .string()
    .regex(/^\d{4}-\d{1,2}$/)
    .optional()
    .default(defaultMonth)
    .transform((arg) => {
      const [year, month] = arg.split("-");
      return new Date(+year, +month - 1);
    }),
});

export const useTimeSheetSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  createEffect(() => {
    console.log({ searchParams });
  });

  createEffect(() => {
    console.log({
      expanded: searchParams.expanded,
      month: searchParams.month,
    });
  });

  const params = createMemo(() => {
    const parsed = paramsSchema.safeParse({
      expanded: searchParams.expanded,
      month: searchParams.month,
    });

    console.log({ parsed });

    return parsed.success ? parsed.data : { expanded: [], month: defaultDate };
  });

  const hideProject = (projectId: number) => {
    const current = params();
    setSearchParams({
      expanded:
        current.expanded &&
        current.expanded.filter((id) => id !== projectId).join(","),
    });
  };

  const showProject = (projectId: number) => {
    const current = params();
    setSearchParams({
      expanded: [...(current.expanded || []), projectId].join(","),
    });
  };

  const setMonth = (date: Date) => {
    const month = formatDateToSearch(date);
    console.log("setMonth", date, month);
    setSearchParams({ month });
  };

  const setPreviousMonth = () => {
    const current = params();
    const date = new Date(current.month);
    date.setMonth(date.getMonth() - 1);
    setMonth(date);
  };

  const setNextMonth = () => {
    const current = params();
    const date = new Date(current.month);
    date.setMonth(date.getMonth() + 1);
    setMonth(date);
  };

  return {
    hideProject,
    params,
    setMonth,
    setNextMonth,
    setPreviousMonth,
    showProject,
  };
};
