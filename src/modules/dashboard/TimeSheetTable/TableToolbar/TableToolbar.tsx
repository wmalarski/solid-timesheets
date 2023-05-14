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
  type CreateTimeEntryArgs,
  type UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import { formatRequestDate } from "~/utils/format";
import {
  copyCheckedEntriesToEndOfMonth,
  copyCheckedEntriesToNextDay,
  deleteCheckedSheetEntries,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type MonthSelectProps = {
  isDisabled: boolean;
};

const MonthSelect: Component<MonthSelectProps> = (props) => {
  const { params, setNextMonth, setPreviousMonth } = useTimeSheetContext();

  return (
    <div class="flex gap-1">
      <Button
        disabled={props.isDisabled}
        onClick={setPreviousMonth}
        size="xs"
        variant="outline"
      >
        -
      </Button>
      <span>{formatRequestDate(params().date)}</span>
      <Button
        disabled={props.isDisabled}
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
  isDisabled: boolean;
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
    const checked = state.checked.filter((id) => id in state.updateMap);
    mutation.mutate({ ids: checked });
  };

  return (
    <Button
      color="error"
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
    >
      {t("dashboard.timeEntry.delete")}
    </Button>
  );
};

type CopyMonthButtonProps = {
  isDisabled: boolean;
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
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
    >
      {t("dashboard.timeEntry.copyMonthEnd")}
    </Button>
  );
};

type CopyNextDayButtonProps = {
  isDisabled: boolean;
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
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
    >
      {t("dashboard.timeEntry.copyNextDay")}
    </Button>
  );
};

type SaveButtonProps = {
  isDisabled: boolean;
};

const SaveButton: Component<SaveButtonProps> = (props) => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntriesServerMutation,
    mutationKey: createTimeEntriesKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      deleteCheckedSheetEntries({ setState });
    },
  }));

  const onSaveClick = () => {
    const toCreate: CreateTimeEntryArgs[] = [];
    const toUpdate: UpdateTimeEntryArgs[] = [];

    state.checked.forEach((id) => {
      const created = state.createMap[id];

      if (created) {
        toCreate.push(created);
        return;
      }

      const updated = state.updateMap[id];

      if (updated) {
        toUpdate.push(updated);
        return;
      }
    });
    mutation.mutate(toCreate);
  };

  return (
    <Button
      color="primary"
      disabled={props.isDisabled}
      onClick={onSaveClick}
      size="xs"
    >
      {t("dashboard.saveAll")}
    </Button>
  );
};

export const TableToolbar: Component = () => {
  const { state } = useTimeSheetContext();

  const count = createMemo(() => state.checked.length);

  const isMutating = useIsMutating();

  const isDisabled = createMemo(() => {
    return isMutating() > 0 && count() < 1;
  });

  return (
    <div class="flex justify-between gap-2 p-2">
      <MonthSelect isDisabled={isDisabled()} />
      <div>
        <DeleteButton isDisabled={isDisabled()} />
        <CopyMonthButton isDisabled={isDisabled()} />
        <CopyNextDayButton isDisabled={isDisabled()} />
        <SaveButton isDisabled={isDisabled()} />
      </div>
    </div>
  );
};
