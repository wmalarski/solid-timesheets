import { createContext, createMemo, useContext } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import { useSearchParams } from "solid-start";
import { z } from "zod";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import {
  getDaysLeftInMonth,
  getFirstDayOfMonth,
  getNextDay,
  getNextMonth,
  getPreviousMonth,
  isDayOff,
} from "~/utils/date";
import { formatRequestDate } from "~/utils/format";

const defaultDate = getFirstDayOfMonth(new Date());

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
    setMonth(getPreviousMonth(params().date || defaultDate));
  };

  const setNextMonth = () => {
    setMonth(getNextMonth(params().date || defaultDate));
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
  date: Date;
};

export const createdTimeEntriesKey = (args: CreatedTimeEntriesKeyArgs) => {
  return `${formatRequestDate(args.date)}-${args.issueId}`;
};

export type CreateTimeEntry = {
  args: CreateTimeEntryArgs;
  isChecked: boolean;
};

export type CreatedTimeSeriesStore = {
  map: Record<string, CreateTimeEntry[]>;
  checked: number[];
};

export const useCreatedTimeSeries = () => {
  const [createdTimeEntries, setCreatedTimeEntries] =
    createStore<CreatedTimeSeriesStore>({ checked: [], map: {} });

  return {
    createdTimeEntries,
    setCreatedTimeEntries,
  };
};

type CopyTimeEntryToEndOfMonthArgs = {
  args: CreateTimeEntryArgs;
  setStore: SetStoreFunction<CreatedTimeSeriesStore>;
};

export const copyTimeEntryToEndOfMonth = ({
  args,
  setStore,
}: CopyTimeEntryToEndOfMonthArgs) => {
  const newEntries = getDaysLeftInMonth(args.spentOn)
    .filter((date) => !isDayOff(date))
    .map((date) => {
      const key = createdTimeEntriesKey({ date, issueId: args.issueId });
      return { args: { ...args, spentOn: date }, key };
    });

  setStore(
    produce((store) => {
      newEntries.forEach((entry) => {
        const keyEntries = store.map[entry.key] || [];
        keyEntries.push({ args: entry.args, isChecked: true });
        store.map[entry.key] = keyEntries;
      });
    })
  );
};

type CopyTimeEntryToNextDayArgs = {
  args: CreateTimeEntryArgs;
  setStore: SetStoreFunction<CreatedTimeSeriesStore>;
};

export const copyTimeEntryToNextDay = ({
  args,
  setStore,
}: CopyTimeEntryToNextDayArgs) => {
  const nextDate = getNextDay(args.spentOn);
  const key = createdTimeEntriesKey({ date: nextDate, issueId: args.issueId });

  setStore(
    produce((store) => {
      const keyEntries = store.map[key] || [];
      const currentArgs = { ...args, spentOn: nextDate };
      keyEntries.push({ args: currentArgs, isChecked: true });
      store.map[key] = keyEntries;
    })
  );
};

type TimeSheetContextValue = ReturnType<typeof useCreatedTimeSeries> &
  ReturnType<typeof useTimeSheetSearchParams> & {
    days: () => Date[];
  };

export const TimeSheetContext = createContext<TimeSheetContextValue>({
  createdTimeEntries: { checked: [], map: {} },
  days: () => [],
  params: () => defaultParams,
  setCreatedTimeEntries: () => void 0,
  setNextMonth: () => void 0,
  setPreviousMonth: () => void 0,
  toggleProject: () => void 0,
});

export const useTimeSheetContext = () => {
  return useContext(TimeSheetContext);
};
