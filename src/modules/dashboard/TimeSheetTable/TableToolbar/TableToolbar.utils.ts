import type { TimeSheetStore } from "../TimeSheetTable.utils";

export const selectedTimeEntries = (state: TimeSheetStore) => {
  // state.
};

export const sumCreatedTimeEntries = (state: TimeSheetStore) => {
  return Object.values(state.created).reduce((prev, curr) => {
    return prev + curr.length;
  }, 0);
};
