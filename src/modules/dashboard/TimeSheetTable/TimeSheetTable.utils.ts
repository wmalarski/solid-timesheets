import { createContext, createEffect, createMemo, useContext } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import { useSearchParams } from "solid-start";
import { z } from "zod";
import type {
  CreateTimeEntryArgs,
  UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import type { TimeEntry } from "~/server/types";
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
});

type TimeSheetSearchParams = Required<z.infer<typeof paramsSchema>>;

const defaultParams: TimeSheetSearchParams = {
  date: defaultDate,
};

export const useTimeSheetSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = createMemo(() => {
    const parsed = paramsSchema.safeParse({ date: searchParams.date });
    return parsed.success ? parsed.data : defaultParams;
  });

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
  };
};

type TimeSheetConfigValue = ReturnType<typeof useTimeSheetSearchParams> & {
  days: () => Date[];
};

export const TimeSheetConfig = createContext<TimeSheetConfigValue>({
  days: () => [],
  params: () => defaultParams,
  setNextMonth: () => void 0,
  setPreviousMonth: () => void 0,
});

export const useTimeSheetConfig = () => {
  return useContext(TimeSheetConfig);
};

type SheetEntryMapKeyArgs = {
  date: Date;
};

export const sheetEntryMapKey = (args: SheetEntryMapKeyArgs) => {
  return formatRequestDate(args.date);
};

export type CreatingEntryData = {
  args: CreateTimeEntryArgs;
  id: number;
};

export type UpdatingEntryData = {
  args: UpdateTimeEntryArgs;
  isEditing: boolean;
};

export type EntriesStore = {
  dateMap: Record<string, Record<number, CreatingEntryData | undefined>>;
  timeEntryMap: ReadonlyMap<number, CreateTimeEntryArgs>;
  updateMap: Record<number, UpdatingEntryData | undefined>;
};

type UseCreatedTimeSeriesArgs = {
  timeEntries: () => TimeEntry[];
};

export const useCreatedTimeSeries = ({
  timeEntries,
}: UseCreatedTimeSeriesArgs) => {
  const [state, setState] = createStore<EntriesStore>({
    dateMap: {},
    timeEntryMap: new Map(),
    updateMap: {},
  });

  createEffect(() => {
    const map = new Map<number, CreateTimeEntryArgs>();

    timeEntries().forEach((entry) => {
      map.set(entry.id, {
        activityId: entry.activity.id,
        comments: entry.comments,
        hours: entry.hours,
        issueId: entry.issue.id,
        spentOn: new Date(entry.spent_on),
      });
    });

    const readonlyMap = map as EntriesStore["timeEntryMap"];

    setState("timeEntryMap", readonlyMap);
  });

  return { setState, state };
};

type TimeSheetContextValue = ReturnType<typeof useCreatedTimeSeries>;

export const TimeSheetContext = createContext<TimeSheetContextValue>({
  setState: () => void 0,
  state: {
    dateMap: {},
    timeEntryMap: new Map(),
    updateMap: {},
  },
});

export const useTimeSheetContext = () => {
  return useContext(TimeSheetContext);
};

const randomEntryId = () => {
  return -Math.floor(Math.random() * 1e15);
};

const copySheetEntry = (args: CreateTimeEntryArgs) => {
  const key = sheetEntryMapKey({ date: args.spentOn });
  return { args, id: randomEntryId(), key };
};

export const createSheetEntriesToMonthEnd = (args: CreateTimeEntryArgs) => {
  return getDaysLeftInMonth(args.spentOn)
    .filter((date) => !isDayOff(date))
    .map((date) => copySheetEntry({ ...args, spentOn: date }));
};

type AddSheetEntryToStateArgs = ReturnType<typeof copySheetEntry> & {
  store: EntriesStore;
};

const addSheetEntryToState = ({
  args,
  id,
  key,
  store,
}: AddSheetEntryToStateArgs) => {
  const keyEntries = store.dateMap[key] || {};
  keyEntries[id] = { args, id };
  store.dateMap[key] = keyEntries;
};

type CopyCreatedToEndOfMonthArgs = {
  id: number;
  key: string;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyCreatedToEndOfMonth = ({
  id,
  key,
  setState,
}: CopyCreatedToEndOfMonthArgs) => {
  setState(
    produce((store) => {
      const entry = store.dateMap[key]?.[id];

      if (!entry) {
        return;
      }

      createSheetEntriesToMonthEnd(entry.args).forEach((entry) =>
        addSheetEntryToState({ ...entry, store })
      );
    })
  );
};

type CopyUpdatedToEndOfMonthArgs = {
  id: number;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyUpdatedToEndOfMonth = ({
  id,
  setState,
}: CopyUpdatedToEndOfMonthArgs) => {
  setState(
    produce((store) => {
      const args = store.timeEntryMap.get(id);

      if (!args) {
        return;
      }

      createSheetEntriesToMonthEnd(args).forEach((entry) =>
        addSheetEntryToState({ ...entry, store })
      );
    })
  );
};

type CopyCreatedToNextDayArgs = {
  id: number;
  key: string;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyCreatedToNextDay = ({
  id,
  key,
  setState,
}: CopyCreatedToNextDayArgs) => {
  setState(
    produce((store) => {
      const entry = store.dateMap[key]?.[id];

      if (!entry) {
        return;
      }

      const date = getNextDay(entry.args.spentOn);
      const newEntry = copySheetEntry({ ...entry.args, spentOn: date });
      addSheetEntryToState({ ...newEntry, store });
    })
  );
};

type CopyUpdatedToNextDayArgs = {
  id: number;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyUpdatedToNextDay = ({
  id,
  setState,
}: CopyUpdatedToNextDayArgs) => {
  setState(
    produce((store) => {
      const args = store.timeEntryMap.get(id);

      if (!args) {
        return;
      }
      const date = getNextDay(args.spentOn);
      const newEntry = copySheetEntry({ ...args, spentOn: date });
      addSheetEntryToState({ ...newEntry, store });
    })
  );
};

type CreateSheetEntryArgs = {
  args: CreateTimeEntryArgs;
  setState: SetStoreFunction<EntriesStore>;
};

export const createSheetEntryArgs = ({
  args,
  setState,
}: CreateSheetEntryArgs) => {
  setState(
    produce((store) => {
      const entry = copySheetEntry(args);
      addSheetEntryToState({ ...entry, store });
    })
  );
};

type CopyCreatedToCurrentDayArgs = {
  id: number;
  key: string;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyCreatedToCurrentDay = ({
  id,
  key,
  setState,
}: CopyCreatedToCurrentDayArgs) => {
  setState(
    produce((store) => {
      const entry = store.dateMap[key]?.[id];

      if (!entry) {
        return;
      }

      const newEntry = copySheetEntry({ ...entry.args });
      addSheetEntryToState({ ...newEntry, store });
    })
  );
};

type CopyUpdatedToCurrentDayArgs = {
  id: number;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyUpdatedToCurrentDay = ({
  id,
  setState,
}: CopyUpdatedToCurrentDayArgs) => {
  setState(
    produce((store) => {
      const args = store.timeEntryMap.get(id);

      if (!args) {
        return;
      }

      const newEntry = copySheetEntry(args);
      addSheetEntryToState({ ...newEntry, store });
    })
  );
};

type ResetSheetEntriesArgs = {
  setState: SetStoreFunction<EntriesStore>;
};

export const resetSheetEntries = ({ setState }: ResetSheetEntriesArgs) => {
  setState(
    produce((store) => {
      store.dateMap = {};
      store.updateMap = {};
    })
  );
};
