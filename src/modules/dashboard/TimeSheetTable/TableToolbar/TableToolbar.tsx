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
  deleteTimeEntriesServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import { formatRequestDate } from "~/utils/format";
import {
  copyCheckedEntriesToEndOfMonth,
  deleteCheckedSheetEntries,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

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

type DeleteButtonProps = {
  isPending: boolean;
};

const DeleteButton: Component<DeleteButtonProps> = (props) => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: deleteTimeEntriesServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      deleteCheckedSheetEntries({ setState });
    },
  }));

  const onDeleteClick = () => {
    const checkedToDelete = Object.keys(state.checked).map(Number);
    mutation.mutate({ ids: checkedToDelete });
  };

  return (
    <Button
      color="error"
      disabled={props.isPending}
      onClick={onDeleteClick}
      size="xs"
    >
      {t("dashboard.timeEntry.delete")}
    </Button>
  );
};

type CopyMonthButtonProps = {
  isPending: boolean;
};

const CopyMonthButton: Component<CopyMonthButtonProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onCopyEndMonth = () => {
    copyCheckedEntriesToEndOfMonth({ setState });
  };

  return (
    <Button
      color="success"
      disabled={props.isPending}
      onClick={onCopyEndMonth}
      size="xs"
    >
      {t("dashboard.timeEntry.copyMonthEnd")}
    </Button>
  );
};

export const TableToolbar: Component = () => {
  const [t] = useI18n();

  const { state } = useTimeSheetContext();

  const count = createMemo(() => state.checked.length);

  const isMutating = useIsMutating();

  const isPending = () => {
    return isMutating() > 0;
  };

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntriesServerMutation,
    mutationKey: createTimeEntriesKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      // setState({ created: {} });
    },
  }));

  const onSaveClick = () => {
    // const entries = Object.values(state.created).flat();
    // mutation.mutate(entries.map((entry) => entry.args));
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
        <DeleteButton isPending={isPending()} />
        <CopyMonthButton isPending={isPending()} />
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
