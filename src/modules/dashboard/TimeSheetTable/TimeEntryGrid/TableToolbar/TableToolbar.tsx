import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import {
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoDownloadSharp,
  IoReloadSharp,
  IoSaveSharp,
} from "solid-icons/io";
import { createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { showToast } from "~/components/Toast";
import { useDashboardConfig } from "~/modules/dashboard/DashboardConfig";
import {
  getAllTimeEntriesKey,
  upsertTimeEntriesServerMutation,
  workTimeHref,
} from "~/server/timeEntries";
import { getNextMonth, getPreviousMonth } from "~/utils/date";
import { formatMonth } from "~/utils/format";
import { resetSheetEntries, useTimeSheetContext } from "../../EntriesStore";
import { useTimeSheetSearchParams } from "../../TimeSheetTable.utils";

type MonthSelectProps = {
  isDisabled: boolean;
};

const MonthSelect: Component<MonthSelectProps> = (props) => {
  const { selectedDate, setMonth } = useTimeSheetSearchParams();

  const setPreviousMonth = () => {
    setMonth(getPreviousMonth(selectedDate()));
  };

  const setNextMonth = () => {
    setMonth(getNextMonth(selectedDate()));
  };

  return (
    <div class="flex items-center gap-1">
      <Button
        disabled={props.isDisabled}
        onClick={setPreviousMonth}
        size="sm"
        variant="ghost"
      >
        <IoChevronBackSharp />
      </Button>
      <Button
        disabled={props.isDisabled}
        onClick={setNextMonth}
        size="sm"
        variant="ghost"
      >
        <IoChevronForwardSharp />
      </Button>
      <span class="text-base sm:text-lg md:text-2xl">
        {formatMonth(selectedDate())}
      </span>
    </div>
  );
};

type ResetButtonProps = {
  count: number;
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
      size="sm"
      variant="ghost"
    >
      <IoReloadSharp />
      <span class="hidden sm:block">
        {t("dashboard.reset", { count: String(props.count) })}
      </span>
    </Button>
  );
};

type SaveButtonProps = {
  count: number;
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
      entry ? [entry.args] : []
    );

    mutation.mutate({ create, update });
  };

  return (
    <Button
      disabled={props.isDisabled}
      onClick={onSaveClick}
      size="sm"
      variant="outline"
    >
      <IoSaveSharp />
      <span class="hidden sm:block">
        {t("dashboard.saveAll", { count: String(props.count) })}
      </span>
    </Button>
  );
};

type DownloadButtonProps = {
  isDisabled: boolean;
};

const DownloadButton: Component<DownloadButtonProps> = (props) => {
  const [t] = useI18n();

  const { selectedDate } = useTimeSheetSearchParams();
  const config = useDashboardConfig();

  const onSaveClick = () => {
    const date = selectedDate();
    const configData = config();

    const href = workTimeHref({
      date,
      rmBaseUrl: configData.rmBaseUrl,
      userId: configData.userId,
    });

    window.location.href = href;
  };

  return (
    <Button
      disabled={props.isDisabled}
      onClick={onSaveClick}
      size="sm"
      variant="outline"
      aria-label={t("dashboard.report")}
    >
      <IoDownloadSharp />
      <span class="hidden sm:block">{t("dashboard.report")}</span>
    </Button>
  );
};

export const TableToolbar: Component = () => {
  const { state } = useTimeSheetContext();

  const isMutating = useIsMutating();

  const selectedCount = createMemo(() => {
    const updateEntries = Object.values(state.updateMap);

    const createEntries = Object.values(state.dateMap).flatMap((entries) =>
      Object.values(entries)
    );

    const entries = [...updateEntries, ...createEntries];

    return entries.map((entry) => !!entry).length;
  });

  const isDisabled = createMemo(() => {
    return isMutating() > 0;
  });

  const shouldDisableActions = createMemo(() => {
    return isMutating() > 0 || selectedCount() < 1;
  });

  return (
    <div class="flex items-center justify-between gap-2 border-b-[1px] border-base-300 p-2">
      <MonthSelect isDisabled={isDisabled()} />
      <div class="flex gap-1">
        <ResetButton
          count={selectedCount()}
          isDisabled={shouldDisableActions()}
        />
        <SaveButton
          count={selectedCount()}
          isDisabled={shouldDisableActions()}
        />
        <DownloadButton isDisabled={isDisabled()} />
      </div>
    </div>
  );
};
