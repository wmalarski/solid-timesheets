import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { ChevronDownIcon } from "~/components/Icons/ChevronDownIcon";
import {
  createTimeEntriesServerMutation,
  deleteTimeEntriesServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import { formatRequestDate } from "~/utils/format";
import {
  copyCheckedEntriesToEndOfMonth,
  copyCheckedEntriesToNextDay,
  deleteCheckedSheetEntries,
  useTimeSheetConfig,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type MonthSelectProps = {
  isDisabled: boolean;
};

const MonthSelect: Component<MonthSelectProps> = (props) => {
  const { params, setNextMonth, setPreviousMonth } = useTimeSheetConfig();

  return (
    <div class="flex gap-1">
      <Button
        disabled={props.isDisabled}
        onClick={setPreviousMonth}
        size="xs"
        variant="ghost"
      >
        <ChevronDownIcon class="h-4 w-4 rotate-90" />
      </Button>
      <span>{formatRequestDate(params().date)}</span>
      <Button
        disabled={props.isDisabled}
        onClick={setNextMonth}
        size="xs"
        variant="ghost"
      >
        <ChevronDownIcon class="h-4 w-4 -rotate-90" />
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
    const checked = Object.values(state.updateMap).flatMap((entry) =>
      entry?.isChecked ? [entry.args.id] : []
    );
    mutation.mutate({ ids: checked });
  };

  return (
    <Button
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
      variant="outline"
    >
      ❌ {t("dashboard.timeEntry.delete")}
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
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
      variant="outline"
    >
      ⏭️ {t("dashboard.timeEntry.copyMonthEnd")}
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
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
      variant="outline"
    >
      1️⃣ {t("dashboard.timeEntry.copyNextDay")}
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      deleteCheckedSheetEntries({ setState });
    },
  }));

  const onSaveClick = () => {
    const toCreate = Object.values(state.dateMap)
      .flatMap((entries) => Object.values(entries))
      .flatMap((entry) => (entry?.isChecked ? [entry.args] : []));

    // const toUpdate = Object.values(state.updateMap).flatMap((entry) =>
    //   entry?.isChecked ? [entry.args] : []
    // );

    mutation.mutate(toCreate);
  };

  return (
    <Button
      disabled={props.isDisabled}
      onClick={onSaveClick}
      size="xs"
      variant="outline"
    >
      ✅ {t("dashboard.saveAll")}
    </Button>
  );
};

export const TableToolbar: Component = () => {
  const isMutating = useIsMutating();

  const isDisabled = createMemo(() => {
    return isMutating() > 0;
  });

  return (
    <div class="flex justify-between gap-2 p-2">
      <MonthSelect isDisabled={isDisabled()} />
      <div class="flex gap-2">
        <DeleteButton isDisabled={isDisabled()} />
        <CopyNextDayButton isDisabled={isDisabled()} />
        <CopyMonthButton isDisabled={isDisabled()} />
        <SaveButton isDisabled={isDisabled()} />
      </div>
    </div>
  );
};
