import { createContext, createMemo, createSignal, useContext } from "solid-js";
import { useSearchParams } from "solid-start";
import { z } from "zod";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { formatRequestDate } from "~/utils/format";

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

type TimeSheetSearchParams = Required<z.infer<typeof paramsSchema>>;

const defaultParams: TimeSheetSearchParams = {
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
    params,
    setNextMonth,
    setPreviousMonth,
    toggleProject,
  };
};

type CreatedTimeEntriesKeyArgs = {
  issueId: number;
  day: Date;
};

export const createdTimeEntriesKey = (args: CreatedTimeEntriesKeyArgs) => {
  return `${formatRequestDate(args.day)}-${args.issueId}`;
};

export const useCreatedTimeSeries = () => {
  const [createdTimeEntries, setCreatedTimeEntries] = createSignal<
    Record<string, CreateTimeEntryArgs[]>
  >({});

  const createTimeEntry = (args: CreateTimeEntryArgs) => {
    setCreatedTimeEntries((current) => {
      const key = createdTimeEntriesKey({
        day: args.spentOn,
        issueId: args.issueId,
      });
      const updated = [...(current[key] || []), args];
      return { ...current, [key]: updated };
    });
  };

  const updateTimeEntry = (index: number, args: CreateTimeEntryArgs) => {
    setCreatedTimeEntries((current) => {
      const key = createdTimeEntriesKey({
        day: args.spentOn,
        issueId: args.issueId,
      });

      const updated = [...(current[key] || [])];
      updated.splice(index, 1, args);
      return { ...current, [key]: updated };
    });
  };

  const deleteTimeEntry = (index: number, args: CreateTimeEntryArgs) => {
    setCreatedTimeEntries((current) => {
      const key = createdTimeEntriesKey({
        day: args.spentOn,
        issueId: args.issueId,
      });

      const updated = [...(current[key] || [])];
      updated.splice(index, 1);
      return { ...current, [key]: updated };
    });
  };

  const deleteAllTimeEntries = () => {
    setCreatedTimeEntries({});
  };

  return {
    createTimeEntry,
    createdTimeEntries,
    deleteAllTimeEntries,
    deleteTimeEntry,
    updateTimeEntry,
  };
};

export const sumCreatedTimeEntries = (
  created: Record<string, CreateTimeEntryArgs[]>
) => {
  return Object.values(created).reduce((prev, curr) => {
    return prev + curr.length;
  }, 0);
};

type TimeSheetContextValue = ReturnType<typeof useCreatedTimeSeries> &
  ReturnType<typeof useTimeSheetSearchParams> & {
    days: () => Date[];
  };

export const TimeSheetContext = createContext<TimeSheetContextValue>({
  createTimeEntry: () => void 0,
  createdTimeEntries: () => ({}),
  days: () => [],
  deleteAllTimeEntries: () => void 0,
  deleteTimeEntry: () => void 0,
  params: () => defaultParams,
  setNextMonth: () => void 0,
  setPreviousMonth: () => void 0,
  toggleProject: () => void 0,
  updateTimeEntry: () => void 0,
});

export const useTimeSheetContext = () => {
  return useContext(TimeSheetContext);
};
