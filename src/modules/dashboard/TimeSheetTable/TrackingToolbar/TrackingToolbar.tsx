import { createWritableMemo } from "@solid-primitives/memo";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import {
  IoPauseSharp,
  IoPlaySharp,
  IoReloadSharp,
  IoStopSharp,
} from "solid-icons/io";
import {
  Show,
  Suspense,
  createEffect,
  createMemo,
  lazy,
  onCleanup,
  type Component,
} from "solid-js";
import { Button } from "~/components/Button";
import { ClientOnly } from "~/components/ClientOnly";
import { Countdown } from "~/components/Countdown";
import { showToastAsync } from "~/components/Toast/showToastAsync";
import { useI18n } from "~/contexts/I18nContext";
import {
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
} from "~/server/timeEntries";
import { secondsToNow } from "~/utils/date";
import { formatTime } from "~/utils/format";
import { useTimeSheetContext } from "../EntriesStore";
import { useTrackingStoreContext, type TrackingItem } from "../TrackingStore";

const DeleteAlertDialog = lazy(() =>
  import("../DeleteAlertDialog").then((module) => ({
    default: module.DeleteAlertDialog,
  }))
);

type CreateTimeCounterArgs = {
  item: () => TrackingItem | undefined;
  isRunning: () => boolean;
};

export const createTimeCounter = (args: CreateTimeCounterArgs) => {
  const [counter, setCounter] = createWritableMemo(
    () => args.item()?.startValue || 0
  );

  createEffect(() => {
    if (!args.isRunning()) {
      return;
    }
    const interval = setInterval(() => {
      const current = args.item();
      if (current) {
        setCounter(current.startValue + secondsToNow(current.startDate));
      }
    }, 1000);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  return counter;
};

type TrackingTimeProps = {
  isRunning: boolean;
  item?: TrackingItem;
};

export const TrackingTime: Component<TrackingTimeProps> = (props) => {
  const counter = createTimeCounter({
    isRunning: () => props.isRunning,
    item: () => props.item,
  });

  return (
    <span class="grow text-xs">
      <Show when={props.item} fallback={formatTime(0)}>
        <Countdown seconds={counter()} />
      </Show>
    </span>
  );
};

type SaveButtonProps = {
  item?: TrackingItem;
  timeEntryId: number;
};

const SaveButton: Component<SaveButtonProps> = (props) => {
  const { t } = useI18n();

  const { state } = useTimeSheetContext();
  const { reset } = useTrackingStoreContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: updateTimeEntryServerMutation,
    onError: async () => {
      await showToastAsync({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      reset(props.timeEntryId);
      await showToastAsync({
        description: t("dashboard.toasts.updated"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onSaveClick = () => {
    const entry = state.timeEntryMap.get(props.timeEntryId);
    const item = props.item;
    if (!entry || !item) {
      return;
    }

    const seconds = item.startValue + secondsToNow(item.startDate);
    const hours = seconds / (60 * 60);

    mutation.mutate({
      hours: hours + entry.hours,
      id: props.timeEntryId,
    });
  };

  return (
    <Button
      aria-label={t("dashboard.tracking.stop")}
      disabled={!props.item}
      onClick={onSaveClick}
      shape="square"
      size="sm"
      variant="ghost"
    >
      <IoStopSharp class="h-4 w-4" />
    </Button>
  );
};

type TrackingCardProps = {
  timeEntryId: number;
};

export const TrackingCard: Component<TrackingCardProps> = (props) => {
  const { t } = useI18n();

  const { runningId, pause, reset, items, start } = useTrackingStoreContext();

  const isCurrentRunning = createMemo(() => {
    return props.timeEntryId === runningId();
  });

  const item = createMemo(() => {
    return items()[props.timeEntryId];
  });

  const onPauseClick = () => {
    pause(props.timeEntryId);
  };

  const onResetClick = () => {
    reset(props.timeEntryId);
  };

  const onStartClick = () => {
    start(props.timeEntryId);
  };

  return (
    <div class="flex items-center">
      <TrackingTime item={item()} isRunning={isCurrentRunning()} />
      <Show when={item()}>
        <Suspense>
          <DeleteAlertDialog
            aria-label={t("dashboard.tracking.reset")}
            disabled={!item()}
            onConfirm={onResetClick}
            shape="square"
            size="sm"
            variant="ghost"
          >
            <IoReloadSharp class="h-4 w-4" />
          </DeleteAlertDialog>
        </Suspense>
      </Show>
      <Show
        when={isCurrentRunning()}
        fallback={
          <Button
            aria-label={t("dashboard.tracking.start")}
            onClick={onStartClick}
            shape="square"
            size="sm"
            variant="ghost"
          >
            <IoPlaySharp class="h-4 w-4" />
          </Button>
        }
      >
        <Button
          aria-label={t("dashboard.tracking.pause")}
          onClick={onPauseClick}
          shape="square"
          size="sm"
          variant="ghost"
        >
          <IoPauseSharp class="h-4 w-4" />
        </Button>
      </Show>
      <Show when={item()}>
        <SaveButton item={item()} timeEntryId={props.timeEntryId} />
      </Show>
    </div>
  );
};

type TrackingRowProps = {
  timeEntryId: number;
};

export const TrackingRow: Component<TrackingRowProps> = (props) => {
  return (
    <ClientOnly>
      <TrackingCard timeEntryId={props.timeEntryId} />
    </ClientOnly>
  );
};

const TrackingToolbarClient: Component = () => {
  const { runningId } = useTrackingStoreContext();

  return (
    <Show when={runningId()}>
      {(runningId) => <TrackingCard timeEntryId={runningId()} />}
    </Show>
  );
};

export const TrackingToolbar: Component = () => {
  return (
    <ClientOnly>
      <TrackingToolbarClient />
    </ClientOnly>
  );
};
