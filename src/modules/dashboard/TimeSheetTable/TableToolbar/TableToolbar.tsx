import { useI18n } from "@solid-primitives/i18n";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import {
  createTimeEntriesKey,
  createTimeEntriesServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import { formatRequestDate } from "~/utils/format";
import { useTimeSheetContext } from "../TimeSheetTable.utils";
import { sumCreatedTimeEntries } from "./TableToolbar.utils";

const MonthSelect: Component = () => {
  const { params, setNextMonth, setPreviousMonth } = useTimeSheetContext();

  return (
    <div class="flex gap-1">
      <Button size="xs" variant="outline" onClick={setPreviousMonth}>
        -
      </Button>
      <span>{formatRequestDate(params().date)}</span>
      <Button size="xs" variant="outline" onClick={setNextMonth}>
        +
      </Button>
    </div>
  );
};

export const TableToolbar: Component = () => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const count = createMemo(() => sumCreatedTimeEntries(state));

  const onDeleteAllClick = () => {
    setState({ created: {} });
  };

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntriesServerMutation,
    mutationKey: createTimeEntriesKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState({ created: {} });
    },
  }));

  const onSaveClick = () => {
    const entries = Object.values(state.created).flat();
    mutation.mutate(entries.map((entry) => entry.args));
  };

  return (
    <div class="flex justify-between gap-2 p-2">
      <MonthSelect />
      <div>
        <Button
          color="error"
          disabled={count() < 1 || mutation.isPending}
          onClick={onDeleteAllClick}
          size="xs"
          variant="outline"
        >
          {t("dashboard.reset", { count: String(count()) })}
        </Button>
        <Button
          color="success"
          disabled={count() < 1 || mutation.isPending}
          onClick={onSaveClick}
          size="xs"
          variant="outline"
        >
          {t("dashboard.saveAll", { count: String(count()) })}
        </Button>
      </div>
    </div>
  );
};
