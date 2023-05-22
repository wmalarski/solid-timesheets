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
  getDaysInMonth,
  getDaysLeftInMonth,
  getDaysLeftInWeek,
  getFirstDayOfMonth,
  getFirstWorkingDay,
  getNextDay,
  getNextMonth,
  getPreviousMonth,
  isDayOff,
} from "~/utils/date";
import { formatRequestDate } from "~/utils/format";

const paramsSchema = z.object({
  date: z.coerce.date().optional(),
});

export const useTimeSheetSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = createMemo(() => {
    const parsed = paramsSchema.safeParse({ date: searchParams.date });
    return parsed.success
      ? parsed.data
      : { date: getFirstDayOfMonth(new Date()) };
  });

  const selectedDate = createMemo(() => {
    return params().date || getFirstDayOfMonth(new Date());
  });

  const setMonth = (date: Date) => {
    setSearchParams({ date: formatRequestDate(date) });
  };

  const setPreviousMonth = () => {
    setMonth(getPreviousMonth(selectedDate()));
  };

  const setNextMonth = () => {
    setMonth(getNextMonth(selectedDate()));
  };

  const days = createMemo(() => getDaysInMonth(selectedDate()));

  return {
    days,
    selectedDate,
    setNextMonth,
    setPreviousMonth,
  };
};

type TimeSheetConfigValue = ReturnType<typeof useTimeSheetSearchParams>;

export const TimeSheetConfig = createContext<TimeSheetConfigValue>({
  days: () => [],
  selectedDate: () => getFirstDayOfMonth(new Date()),
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

export const createSheetEntriesToWeekEnd = (args: CreateTimeEntryArgs) => {
  return getDaysLeftInWeek(args.spentOn)
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

type CopyToEndOfMonthArgs = {
  args?: CreateTimeEntryArgs;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyToEndOfMonth = ({ args, setState }: CopyToEndOfMonthArgs) => {
  if (!args) {
    return;
  }
  setState(
    produce((store) => {
      createSheetEntriesToMonthEnd(args).forEach((entry) =>
        addSheetEntryToState({ ...entry, store })
      );
    })
  );
};

type CopyToEndOfWeekArgs = {
  args?: CreateTimeEntryArgs;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyToEndOfWeek = ({ args, setState }: CopyToEndOfWeekArgs) => {
  if (!args) {
    return;
  }
  setState(
    produce((store) => {
      createSheetEntriesToWeekEnd(args).forEach((entry) =>
        addSheetEntryToState({ ...entry, store })
      );
    })
  );
};

type CopyToNextDayArgs = {
  args?: CreateTimeEntryArgs;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyToNextDay = ({ args, setState }: CopyToNextDayArgs) => {
  if (!args) {
    return;
  }
  setState(
    produce((store) => {
      const date = getNextDay(args.spentOn);
      const newEntry = copySheetEntry({ ...args, spentOn: date });
      addSheetEntryToState({ ...newEntry, store });
    })
  );
};

type CopyToNextWorkingDayArgs = {
  args?: CreateTimeEntryArgs;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyToNextWorkingDay = ({
  args,
  setState,
}: CopyToNextWorkingDayArgs) => {
  if (!args) {
    return;
  }
  setState(
    produce((store) => {
      const date = getFirstWorkingDay(args.spentOn);
      if (!date) {
        return;
      }
      const newEntry = copySheetEntry({ ...args, spentOn: date });
      addSheetEntryToState({ ...newEntry, store });
    })
  );
};

type CopyToCurrentDayArgs = {
  args?: CreateTimeEntryArgs;
  setState: SetStoreFunction<EntriesStore>;
};

export const copyToCurrentDay = ({ args, setState }: CopyToCurrentDayArgs) => {
  if (!args) {
    return;
  }
  setState(
    produce((store) => {
      const newEntry = copySheetEntry({ ...args });
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
