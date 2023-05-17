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
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import {
  resetSheetEntries,
  useTimeSheetConfig,
  useTimeSheetContext,
} from "../../TimeSheetTable.utils";

type MonthSelectProps = {
  isDisabled: boolean;
};

const MonthSelect: Component<MonthSelectProps> = (props) => {
  const [, { locale }] = useI18n();

  const { params, setNextMonth, setPreviousMonth } = useTimeSheetConfig();

  const date = createMemo(() => {
    return Intl.DateTimeFormat(locale(), {
      month: "long",
      year: "numeric",
    }).format(params().date);
  });

  return (
    <div class="flex items-center gap-1">
      <Button
        disabled={props.isDisabled}
        onClick={setPreviousMonth}
        size="xs"
        variant="ghost"
      >
        <ChevronDownIcon class="h-4 w-4 rotate-90" />
      </Button>
      <Button
        disabled={props.isDisabled}
        onClick={setNextMonth}
        size="xs"
        variant="ghost"
      >
        <ChevronDownIcon class="h-4 w-4 -rotate-90" />
      </Button>
      <span class="text-2xl">{date()}</span>
    </div>
  );
};

type DeleteButtonProps = {
  isDisabled: boolean;
};

const DeleteButton: Component<DeleteButtonProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onClick = () => {
    resetSheetEntries({ setState });
  };

  return (
    <Button
      disabled={props.isDisabled}
      onClick={onClick}
      size="xs"
      variant="outline"
    >
      ❌ {t("dashboard.reset")}
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
      resetSheetEntries({ setState });
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
    <div class="flex items-center justify-between gap-2 border-b-[1px] border-gray-300 p-2">
      <MonthSelect isDisabled={isDisabled()} />
      <div class="flex gap-2">
        <DeleteButton isDisabled={isDisabled()} />
        <SaveButton isDisabled={isDisabled()} />
      </div>
    </div>
  );
};
