import { produce, type SetStoreFunction } from "solid-js/store";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { getDaysLeftInMonth, isDayOff } from "~/utils/date";
import { timeEntryMapKey, type TimeSheetStore } from "../TimeSheetTable.utils";

export const sumCreatedTimeEntries = (state: TimeSheetStore) => {
  return Object.values(state.created).reduce((prev, curr) => {
    return prev + curr.length;
  }, 0);
};

type DeleteCheckedEntriesArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const deleteCheckedEntries = ({
  setState,
}: DeleteCheckedEntriesArgs) => {
  setState(
    produce((store) => {
      Object.entries(store.created).forEach(([key, entries]) => {
        const filtered = entries.filter((entry) => !entry.isChecked);
        store.created[Number(key)] = filtered;
      });

      Object.keys(store.checked).forEach((id) => {
        delete store.updated[Number(id)];
      });

      store.checked = {};
    })
  );
};

const getCreatedEntries = (args: CreateTimeEntryArgs) => {
  return getDaysLeftInMonth(args.spentOn)
    .filter((date) => !isDayOff(date))
    .map((date) => {
      const key = timeEntryMapKey({ date, issueId: args.issueId });
      return { args: { ...args, spentOn: date }, key };
    });
};

type CopyCheckedEntriesToEndOfMonthArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const copyCheckedEntriesToEndOfMonth = ({
  setState,
}: CopyCheckedEntriesToEndOfMonthArgs) => {
  setState(
    produce((store) => {
      const args: CreateTimeEntryArgs[] = [];

      Object.values(store.checked).flatMap((entry) => {
        if (entry) {
          args.push(entry);
        }
      });

      Object.values(store.created)
        .flat()
        .forEach((entry) => {
          if (entry.isChecked) {
            args.push(entry.args);
          }
        });

      const newEntries = args.flatMap(getCreatedEntries);

      newEntries.forEach((entry) => {
        const keyEntries = store.created[entry.key] || [];
        keyEntries.push({ args: entry.args, isChecked: true });
        store.created[entry.key] = keyEntries;
      });
    })
  );
};
