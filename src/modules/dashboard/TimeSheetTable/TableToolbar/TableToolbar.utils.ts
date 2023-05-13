import { produce, type SetStoreFunction } from "solid-js/store";
import { sheetEntryMapKey, type TimeSheetStore } from "../TimeSheetTable.utils";

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

type DeleteCheckedEntriesArgs = {
  setState: SetStoreFunction<TimeSheetStore>;
};

export const deleteCheckedEntries = ({
  setState,
}: DeleteCheckedEntriesArgs) => {
  setState(
    produce((store) => {
      store.checked.forEach((id) => {
        deleteArgsFromState({ id, store });
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
