import { produce, type SetStoreFunction } from "solid-js/store";
import { sheetEntryMapKey, type TimeSheetStore } from "../TimeSheetTable.utils";

type DeleteCheckedEntriesArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const deleteCheckedEntries = ({
  setState,
}: DeleteCheckedEntriesArgs) => {
  setState(
    produce((store) => {
      store.checked.forEach((id) => {
        const entry = store.entriesMap[id];
        delete store.entriesMap[id];

        if (!entry || entry.kind === "update") {
          return;
        }

        const key = sheetEntryMapKey({
          date: entry.args.spentOn,
          issueId: entry.args.issueId,
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
      });

      store.checked = [];
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
      // const newEntries = store.checked.map(id => ).flatMap(createSheetEntriesToMonthEnd);

      newEntries.forEach(({ key, ...entry }) => {
        const keyEntries = store.created[key] || [];
        keyEntries.push({ args: entry.args, isChecked: true });
        store.created[key] = keyEntries;
      });
    })
  );
};
