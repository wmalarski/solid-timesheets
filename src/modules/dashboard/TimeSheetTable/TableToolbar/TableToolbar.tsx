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
  copyCheckedEntriesToNextDay,
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

  const onClick = () => {
    const checkedToDelete = Object.keys(state.checked).map(Number);
    mutation.mutate({ ids: checkedToDelete });
  };

  return (
    <Button
      color="error"
      disabled={props.isPending}
      onClick={onClick}
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

  const onClick = () => {
    copyCheckedEntriesToEndOfMonth({ setState });
  };

  return (
    <Button
      color="success"
      disabled={props.isPending}
      onClick={onClick}
      size="xs"
    >
      {t("dashboard.timeEntry.copyMonthEnd")}
    </Button>
  );
};

type CopyNextDayButtonProps = {
  isPending: boolean;
};

const CopyNextDayButton: Component<CopyNextDayButtonProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onClick = () => {
    copyCheckedEntriesToNextDay({ setState });
  };

  return (
    <Button
      color="success"
      disabled={props.isPending}
      onClick={onClick}
      size="xs"
    >
      {t("dashboard.timeEntry.copyNextDay")}
    </Button>
  );
};

export const TableToolbar: Component = () => {
  const [t] = useI18n();

  const { state } = useTimeSheetContext();

  const count = createMemo(() => state.checked.length);

  const isMutating = useIsMutating();

  const isPending = createMemo(() => {
    return isMutating() > 0;
  });

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

  return (
    <div class="flex justify-between gap-2 p-2">
      <MonthSelect isPending={isPending()} />
      <div>
        <DeleteButton isPending={isPending()} />
        <CopyMonthButton isPending={isPending()} />
        <CopyNextDayButton isPending={isPending()} />
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
