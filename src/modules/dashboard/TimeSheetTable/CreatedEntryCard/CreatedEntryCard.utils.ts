import type { SetStoreFunction } from "solid-js/store";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { sheetEntryMapKey, type TimeSheetStore } from "../TimeSheetTable.utils";

type DeleteFromStoreArgs = {
  args: CreateTimeEntryArgs;
  index: number;
  setState: SetStoreFunction<TimeSheetStore>;
};

export const deleteFromStore = ({
  args,
  index,
  setState,
}: DeleteFromStoreArgs) => {
  const key = sheetEntryMapKey({
    date: args.spentOn,
    issueId: args.issueId,
  });

  setState("created", key, (current) => {
    const copy = [...current];
    copy.splice(index, 1);
    return copy;
  });
};
