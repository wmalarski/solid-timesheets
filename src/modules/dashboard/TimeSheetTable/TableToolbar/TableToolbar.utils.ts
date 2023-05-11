import { produce, type SetStoreFunction } from "solid-js/store";
import type { TimeSheetStore } from "../TimeSheetTable.utils";

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
