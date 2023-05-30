import { useI18n } from "@solid-primitives/i18n";
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
  createEffect,
  createMemo,
  onCleanup,
  type Component,
} from "solid-js";
import { Button } from "~/components/Button";
import { ClientOnly } from "~/components/ClientOnly";
import { showToast } from "~/components/Toast";
import {
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
} from "~/server/timeEntries";
import { secondsToNow } from "~/utils/date";
import { formatTime } from "~/utils/format";
import { useTimeSheetContext } from "../EntriesStore";
import { useTrackingStoreContext, type TrackingItem } from "../TrackingStore";

type CreateTimeCounterArgs = {
  item: () => TrackingItem;
  isRunning: () => boolean;
};

export const createTimeCounter = (args: CreateTimeCounterArgs) => {
  const [counter, setCounter] = createWritableMemo(
    () => args.item().startValue
  );

  createEffect(() => {
    if (!args.isRunning()) {
      return;
    }
    const interval = setInterval(() => {
      const current = args.item();
      setCounter(current.startValue + secondsToNow(current.startDate));
    }, 1000);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  return counter;
};

type TrackingTimeProps = {
  isRunning: boolean;
  item: TrackingItem;
};

export const TrackingTime: Component<TrackingTimeProps> = (props) => {
  const counter = createTimeCounter({
    isRunning: () => props.isRunning,
    item: () => props.item,
  });

  return <span class="grow">{formatTime(counter())}</span>;
};

type SaveButtonProps = {
  item: TrackingItem;
  timeEntryId: number;
};

const SaveButton: Component<SaveButtonProps> = (props) => {
  const [t] = useI18n();

  const { state } = useTimeSheetContext();
  const { reset } = useTrackingStoreContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: updateTimeEntryServerMutation,
    onError: () => {
      showToast({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      reset(props.timeEntryId);
      showToast({
        description: t("dashboard.toasts.updated"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onSaveClick = () => {
    const entry = state.timeEntryMap.get(props.timeEntryId);
    if (!entry) {
      return;
    }

    const seconds = props.item.startValue + secondsToNow(props.item.startDate);
    const hours = seconds / (60 * 60);

    mutation.mutate({
      hours: hours + entry.hours,
      id: props.timeEntryId,
    });
  };

  return (
    <Button
      aria-label={t("dashboard.tracking.stop")}
      onClick={onSaveClick}
      shape="square"
      size="sm"
      variant="outline"
    >
      <IoStopSharp />
    </Button>
  );
};

type TrackingCardProps = {
  timeEntryId: number;
};

export const TrackingCard: Component<TrackingCardProps> = (props) => {
  const [t] = useI18n();

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
    <div class="flex items-center gap-1">
      <Show when={item()}>
        {(item) => (
          <>
            <TrackingTime item={item()} isRunning={isCurrentRunning()} />
            <Button
              aria-label={t("dashboard.tracking.reset")}
              onClick={onResetClick}
              shape="square"
              size="sm"
              variant="ghost"
            >
              <IoReloadSharp />
            </Button>
          </>
        )}
      </Show>
      <Show
        when={isCurrentRunning()}
        fallback={
          <Button
            aria-label={t("dashboard.tracking.start")}
            onClick={onStartClick}
            shape="square"
            size="sm"
            variant="outline"
          >
            <IoPlaySharp />
          </Button>
        }
      >
        <Button
          aria-label={t("dashboard.tracking.pause")}
          onClick={onPauseClick}
          shape="square"
          size="sm"
          variant="outline"
        >
          <IoPauseSharp />
        </Button>
      </Show>
      <Show when={item()}>
        {(item) => <SaveButton item={item()} timeEntryId={props.timeEntryId} />}
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
