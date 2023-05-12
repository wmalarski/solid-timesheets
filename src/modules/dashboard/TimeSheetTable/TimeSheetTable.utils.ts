import { createContext, createMemo, useContext } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import { useSearchParams } from "solid-start";
import { z } from "zod";
import type {
  CreateTimeEntryArgs,
  UpdateTimeEntryArgs,
} from "~/server/timeEntries";
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

type SheetEntryMapKeyArgs = {
  issueId: number;
  date: Date;
};

export const sheetEntryMapKey = (args: SheetEntryMapKeyArgs) => {
  return `${formatRequestDate(args.date)}-${args.issueId}`;
};

export type CreateSheetEntry = {
  args: CreateTimeEntryArgs;
  id: number;
  kind: "create";
};

export type UpdateSheetEntry = {
  args: UpdateTimeEntryArgs;
  id: number;
  kind: "update";
};

export type SheetEntry = CreateSheetEntry | UpdateSheetEntry;

export type TimeSheetStore = {
  checked: number[];
  dateMap: Record<string, number[]>;
  entriesMap: Record<number, SheetEntry | undefined>;
};

export const useCreatedTimeSeries = () => {
  const [state, setState] = createStore<TimeSheetStore>({
    checked: [],
    dateMap: {},
    entriesMap: {},
  });

  return { setState, state };
};

const randomEntryId = () => {
  return -Math.floor(Math.random() * 1e15);
};

const copySheetEntry = (args: CreateTimeEntryArgs) => {
  const key = sheetEntryMapKey({ date: args.spentOn, issueId: args.issueId });
  const entry = { args, id: randomEntryId(), kind: "create" as const };
  return { entry, key };
};

export const createSheetEntriesToMonthEnd = (args: CreateTimeEntryArgs) => {
  return getDaysLeftInMonth(args.spentOn)
    .filter((date) => !isDayOff(date))
    .map((date) => copySheetEntry({ ...args, spentOn: date }));
};

type AddSheetEntryToStateArgs = ReturnType<typeof copySheetEntry> & {
  store: TimeSheetStore;
};

const addSheetEntryToState = ({
  entry,
  key,
  store,
}: AddSheetEntryToStateArgs) => {
  const keyEntries = store.dateMap[key] || [];
  keyEntries.push(entry.id);
  store.dateMap[key] = keyEntries;
  store.entriesMap[entry.id] = entry;
  store.checked.push(entry.id);
};

type CopySheetEntryToEndOfMonthArgs = {
  args: CreateTimeEntryArgs;
  setState: SetStoreFunction<TimeSheetStore>;
};

export const copySheetEntryToEndOfMonth = ({
  args,
  setState,
}: CopySheetEntryToEndOfMonthArgs) => {
  setState(
    produce((store) => {
      createSheetEntriesToMonthEnd(args).forEach(({ key, entry }) => {
        addSheetEntryToState({ entry, key, store });
      });
    })
  );
};

type CreateSheetEntryArgs = {
  args: CreateTimeEntryArgs;
  setState: SetStoreFunction<TimeSheetStore>;
};

export const createSheetEntryArgs = ({
  args,
  setState,
}: CreateSheetEntryArgs) => {
  setState(
    produce((store) => {
      const { key, entry } = copySheetEntry(args);
      addSheetEntryToState({ entry, key, store });
    })
  );
};

type CopySheetEntryToNextDayArgs = {
  args: CreateTimeEntryArgs;
  setState: SetStoreFunction<TimeSheetStore>;
};

export const copySheetEntryToNextDay = ({
  args,
  setState,
}: CopySheetEntryToNextDayArgs) => {
  setState(
    produce((store) => {
      const date = getNextDay(args.spentOn);
      const { key, entry } = copySheetEntry({ ...args, spentOn: date });
      addSheetEntryToState({ entry, key, store });
    })
  );
};

type ToggleCheckedSheetEntryArgs = {
  id: number;
  setState: SetStoreFunction<TimeSheetStore>;
};

export const toggleCheckedSheetEntry = ({
  id,
  setState,
}: ToggleCheckedSheetEntryArgs) => {
  setState(
    produce((store) => {
      const index = store.checked.indexOf(id);

      if (index < 0) {
        store.checked.push(id);
        return;
      }

      store.checked.splice(index, 1);
    })
  );
};

type TimeSheetContextValue = ReturnType<typeof useCreatedTimeSeries> &
  ReturnType<typeof useTimeSheetSearchParams> & {
    days: () => Date[];
  };

export const TimeSheetContext = createContext<TimeSheetContextValue>({
  days: () => [],
  params: () => defaultParams,
  setNextMonth: () => void 0,
  setPreviousMonth: () => void 0,
  setState: () => void 0,
  state: { checked: [], dateMap: {}, entriesMap: {} },
  toggleProject: () => void 0,
});

export const useTimeSheetContext = () => {
  return useContext(TimeSheetContext);
};
