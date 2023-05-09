import type { NewTimeEntry } from "../TimeSheetTable.utils";

export const sumCreatedTimeEntries = (
  created: Record<string, NewTimeEntry[]>
) => {
  return Object.values(created).reduce((prev, curr) => {
    return prev + curr.length;
  }, 0);
};
