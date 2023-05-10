import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
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

type MonthSelectProps = {
  isPending: boolean;
};

const MonthSelect: Component<MonthSelectProps> = (props) => {
  const { params, setNextMonth, setPreviousMonth } = useTimeSheetContext();

  return (
    <div class="flex gap-1">
      <Button
        disabled={props.isPending}
        onClick={setPreviousMonth}
        size="xs"
        variant="outline"
      >
        -
      </Button>
      <span>{formatRequestDate(params().date)}</span>
      <Button
        disabled={props.isPending}
        onClick={setNextMonth}
        size="xs"
        variant="outline"
      >
        +
      </Button>
    </div>
  );
};

export const TableToolbar: Component = () => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const count = createMemo(() => sumCreatedTimeEntries(state));

  const isMutating = useIsMutating();

  const isPending = () => {
    return isMutating() > 0;
  };

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

  const onDelete = () => {
    // deleteFromStore({ args: props.args, index: props.index, setState });
  };

  const onCopyEndMonth = () => {
    // copyTimeEntryToEndOfMonth({ args: props.args, setState });
  };

  const onCopyNextDay = () => {
    // copyTimeEntryToNextDay({ args: props.args, setState });
  };

  return (
    <div class="flex justify-between gap-2 p-2">
      <MonthSelect isPending={isPending()} />
      <div>
        <Button
          color="error"
          disabled={mutation.isPending}
          onClick={onDelete}
          size="xs"
        >
          {t("dashboard.timeEntry.delete")}
        </Button>
        <Button
          color="success"
          disabled={mutation.isPending}
          onClick={onCopyEndMonth}
          size="xs"
          variant="outline"
        >
          {t("dashboard.timeEntry.copyMonthEnd")}
        </Button>
        <Button
          color="success"
          disabled={mutation.isPending}
          onClick={onCopyNextDay}
          size="xs"
          variant="outline"
        >
          {t("dashboard.timeEntry.copyNextDay")}
        </Button>
        <Button
          color="error"
          // disabled={props.isPending}
          onClick={onDelete}
          size="xs"
          variant="outline"
        >
          {t("dashboard.timeEntry.delete")}
        </Button>
        <Button
          color="success"
          // disabled={props.isPending}
          onClick={onCopyEndMonth}
          size="xs"
          variant="outline"
        >
          {t("dashboard.timeEntry.copyMonthEnd")}
        </Button>
        <Button
          color="success"
          // disabled={props.isPending}
          onClick={onCopyNextDay}
          size="xs"
          variant="outline"
        >
          {t("dashboard.timeEntry.copyNextDay")}
        </Button>
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
