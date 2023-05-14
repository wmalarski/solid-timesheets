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

type TimeSheetConfigValue = ReturnType<typeof useTimeSheetSearchParams> & {
  days: () => Date[];
};

export const TimeSheetConfig = createContext<TimeSheetConfigValue>({
  days: () => [],
  params: () => defaultParams,
  setNextMonth: () => void 0,
  setPreviousMonth: () => void 0,
  toggleProject: () => void 0,
});

export const useTimeSheetConfig = () => {
  return useContext(TimeSheetConfig);
};

type SheetEntryMapKeyArgs = {
  issueId: number;
  date: Date;
};

export const sheetEntryMapKey = (args: SheetEntryMapKeyArgs) => {
  return `${formatRequestDate(args.date)}-${args.issueId}`;
};

export type CreatingEntryData = {
  args: CreateTimeEntryArgs;
  id: number;
  isChecked: boolean;
};

export type UpdatingEntryData = {
  args: UpdateTimeEntryArgs;
  isChecked: boolean;
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
  const key = sheetEntryMapKey({ date: args.spentOn, issueId: args.issueId });
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
  keyEntries[id] = { args, id, isChecked: true };
  store.dateMap[key] = keyEntries;
};

const getCheckedCreatingEntries = (store: EntriesStore) => {
  const args: CreateTimeEntryArgs[] = [];

  Object.values(store.dateMap).forEach((entries) => {
    Object.values(entries).forEach((entry) => {
      if (entry?.isChecked) {
        args.push(entry.args);
      }
    });
  });

  return args;
};

const getCheckedUpdatingEntries = (store: EntriesStore) => {
  const args: UpdateTimeEntryArgs[] = [];

  Object.values(store.updateMap).forEach((entry) => {
    if (entry?.isChecked) {
      args.push(entry.args);
    }
  });

  return args;
};

const getCheckedCreateEntries = (store: EntriesStore) => {
  const args = getCheckedCreatingEntries(store);

  Object.values(store.updateMap).forEach((updateEntry) => {
    if (!updateEntry?.isChecked) {
      return;
    }
    const createEntry = store.timeEntryMap.get(updateEntry.args.id);
    if (createEntry) {
      args.push(createEntry);
    }
  });

  return args;
};

type CopyCheckedEntriesToEndOfMonthArgs = {
  setState: SetStoreFunction<EntriesStore>;
};

export const copyCheckedEntriesToEndOfMonth = ({
  setState,
}: CopyCheckedEntriesToEndOfMonthArgs) => {
  setState(
    produce((store) => {
      getCheckedCreateEntries(store).forEach((args) => {
        createSheetEntriesToMonthEnd(args).forEach((entry) =>
          addSheetEntryToState({ ...entry, store })
        );
      });
    })
  );
};

type CopyCheckedEntriesToNextDayArgs = {
  setState: SetStoreFunction<EntriesStore>;
};

export const copyCheckedEntriesToNextDay = ({
  setState,
}: CopyCheckedEntriesToNextDayArgs) => {
  setState(
    produce((store) => {
      getCheckedCreateEntries(store).forEach((args) => {
        const date = getNextDay(args.spentOn);
        const entry = copySheetEntry({ ...args, spentOn: date });
        addSheetEntryToState({ ...entry, store });
      });
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

type DeleteCheckedSheetEntriesArgs = {
  setState: SetStoreFunction<EntriesStore>;
};

export const deleteCheckedSheetEntries = ({
  setState,
}: DeleteCheckedSheetEntriesArgs) => {
  setState(
    produce((store) => {
      Object.values(store.dateMap).forEach((entries) => {
        Object.values(entries).forEach((entry) => {
          if (entry?.isChecked) {
            delete entries[entry.id];
          }
        });
      });
      getCheckedUpdatingEntries(store).forEach((entry) => {
        delete store.updateMap[entry.id];
      });
    })
  );
};
