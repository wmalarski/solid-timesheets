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

type SheetEntryMapKeyArgs = {
  issueId: number;
  date: Date;
};

export const sheetEntryMapKey = (args: SheetEntryMapKeyArgs) => {
  return `${formatRequestDate(args.date)}-${args.issueId}`;
};

export type SheetEntryUpdateArgs = CreateTimeEntryArgs & { id: number };

export type TimeSheetStore = {
  checked: number[];
  createMap: Record<number, CreateTimeEntryArgs | undefined>;
  dateMap: Record<string, number[]>;
  updateMap: Record<number, SheetEntryUpdateArgs | undefined>;
};

export const useCreatedTimeSeries = () => {
  const [state, setState] = createStore<TimeSheetStore>({
    checked: [],
    createMap: {},
    dateMap: {},
    updateMap: {},
  });

  return { setState, state };
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
  state: { checked: [], createMap: {}, dateMap: {}, updateMap: {} },
  toggleProject: () => void 0,
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
  store: TimeSheetStore;
};

const addSheetEntryToState = ({
  args,
  id,
  key,
  store,
}: AddSheetEntryToStateArgs) => {
  const keyEntries = store.dateMap[key] || [];
  keyEntries.push(id);
  store.dateMap[key] = keyEntries;
  store.createMap[id] = args;
  store.checked.push(id);
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
      createSheetEntriesToMonthEnd(args).forEach((entry) =>
        addSheetEntryToState({ ...entry, store })
      );
    })
  );
};

type CopyCheckedEntriesToEndOfMonthArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const copyCheckedEntriesToEndOfMonth = ({
  setState,
}: CopyCheckedEntriesToEndOfMonthArgs) => {
  setState(
    produce((store) => {
      const newEntries: ReturnType<typeof createSheetEntriesToMonthEnd> = [];

      store.checked.map((id) => {
        const createArgs = store.createMap[id];
        if (createArgs) {
          newEntries.push(...createSheetEntriesToMonthEnd(createArgs));
          return;
        }

        const updateArgs = store.updateMap[id];
        if (updateArgs) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...args } = updateArgs;
          newEntries.push(...createSheetEntriesToMonthEnd(args));
          return;
        }
      });

      newEntries.forEach((entry) => addSheetEntryToState({ ...entry, store }));
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
      const entry = copySheetEntry({ ...args, spentOn: date });
      addSheetEntryToState({ ...entry, store });
    })
  );
};

type CopyCheckedEntriesToNextDayArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const copyCheckedEntriesToNextDay = ({
  setState,
}: CopyCheckedEntriesToNextDayArgs) => {
  setState(
    produce((store) => {
      const newEntries: ReturnType<typeof createSheetEntriesToMonthEnd> = [];

      store.checked.map((id) => {
        const createArgs = store.createMap[id];
        if (createArgs) {
          const date = getNextDay(createArgs.spentOn);
          const entry = copySheetEntry({ ...createArgs, spentOn: date });
          newEntries.push(entry);
          return;
        }

        const updateArgs = store.updateMap[id];
        if (updateArgs) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...args } = updateArgs;
          const date = getNextDay(args.spentOn);
          const entry = copySheetEntry({ ...args, spentOn: date });
          newEntries.push(entry);
          return;
        }
      });

      newEntries.forEach((entry) => addSheetEntryToState({ ...entry, store }));
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
      const entry = copySheetEntry(args);
      addSheetEntryToState({ ...entry, store });
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

type DeleteArgsFromStateArgs = {
  id: number;
  store: TimeSheetStore;
};

const deleteArgsFromState = ({ id, store }: DeleteArgsFromStateArgs) => {
  const updateArgs = store.updateMap[id];

  if (updateArgs) {
    delete store.updateMap[id];

    return;
  }

  const createArgs = store.createMap[id];

  if (createArgs) {
    delete store.createMap[id];

    const key = sheetEntryMapKey({
      date: createArgs.spentOn,
      issueId: createArgs.issueId,
    });

    const ids = store.dateMap[key];

    if (!ids) {
      return;
    }

    const index = ids.indexOf(id);

    if (index < 0) {
      return;
    }

    ids.splice(index, 1);

    return;
  }
};

type DeleteCheckedSheetEntriesArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const deleteCheckedSheetEntries = ({
  setState,
}: DeleteCheckedSheetEntriesArgs) => {
  setState(
    produce((store) => {
      store.checked.forEach((id) => {
        deleteArgsFromState({ id, store });
      });
      store.checked = [];
    })
  );
};

type DeleteSheetEntryArgs = {
  id: number;
  setState: SetStoreFunction<TimeSheetStore>;
};

export const deleteSheetEntry = ({ id, setState }: DeleteSheetEntryArgs) => {
  setState(
    produce((store) => {
      deleteArgsFromState({ id, store });

      const index = store.checked.indexOf(id);
      store.checked.splice(index, 1);
    })
  );
};
