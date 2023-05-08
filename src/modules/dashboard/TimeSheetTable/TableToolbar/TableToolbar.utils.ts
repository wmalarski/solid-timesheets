import type { CreateTimeEntry } from "../TimeSheetTable.utils";

export const sumCreatedTimeEntries = (
  created: Record<string, CreateTimeEntry[]>
) => {
  return Object.values(created).reduce((prev, curr) => {
    return prev + curr.length;
  }, 0);
};
