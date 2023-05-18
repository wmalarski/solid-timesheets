import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { ChevronDownIcon } from "~/components/Icons/ChevronDownIcon";
import { showToast } from "~/components/Toast";
import {
  getAllTimeEntriesKey,
  upsertTimeEntriesServerMutation,
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
      <span class="text-base sm:text-lg md:text-2xl">{date()}</span>
    </div>
  );
};

type ResetButtonProps = {
  isDisabled: boolean;
};

const ResetButton: Component<ResetButtonProps> = (props) => {
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
      ❌<span class="hidden pl-1 sm:block">{t("dashboard.reset")}</span>
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
    mutationFn: upsertTimeEntriesServerMutation,
    onError: () => {
      showToast({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      resetSheetEntries({ setState });
      showToast({
        description: t("dashboard.toasts.saved"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onSaveClick = () => {
    const create = Object.values(state.dateMap)
      .flatMap((entries) => Object.values(entries))
      .flatMap((entry) => (entry ? [entry.args] : []));

    const update = Object.values(state.updateMap).flatMap((entry) =>
      entry?.isEditing ? [entry.args] : []
    );

    mutation.mutate({ create, update });
  };

  return (
    <Button
      disabled={props.isDisabled}
      onClick={onSaveClick}
      size="xs"
      variant="outline"
    >
      ✅<span class="hidden pl-1 sm:block">{t("dashboard.saveAll")}</span>
    </Button>
  );
};

export const TableToolbar: Component = () => {
  const [t] = useI18n();

  const isMutating = useIsMutating();

  const isDisabled = createMemo(() => {
    return isMutating() > 0;
  });

  return (
    <div class="flex items-center justify-between gap-2 border-b-[1px] border-gray-300 p-2">
      <MonthSelect isDisabled={isDisabled()} />
      <div class="flex gap-1">
        <ResetButton isDisabled={isDisabled()} />
        <SaveButton isDisabled={isDisabled()} />
        <Button
          disabled={isDisabled()}
          // onClick={onSaveClick}
          size="xs"
          variant="outline"
          aria-label=""
        >
          🗒️<span class="hidden pl-1 sm:block">{t("dashboard.report")}</span>
        </Button>
      </div>
    </div>
  );
};
