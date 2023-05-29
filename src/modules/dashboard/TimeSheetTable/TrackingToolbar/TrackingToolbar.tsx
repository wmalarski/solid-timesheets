import { useI18n } from "@solid-primitives/i18n";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import {
  IoPauseSharp,
  IoPlaySharp,
  IoReloadSharp,
  IoStopSharp,
} from "solid-icons/io";
import {
  Show,
  createMemo,
  createSignal,
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

type TrackingTimeProps = {
  item: TrackingItem;
};

export const TrackingTime: Component<TrackingTimeProps> = (props) => {
  const pair = createMemo(() => {
    const [counter, setCounter] = createSignal(
      secondsToNow(props.item.startDate)
    );
    return { counter, setCounter };
  });

  const interval = setInterval(() => {
    pair().setCounter(secondsToNow(props.item.startDate));
  }, 500);

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <span class="grow">
      {formatTime(pair().counter() + props.item.startValue)}
    </span>
  );
};

type StaticTimeProps = {
  item: TrackingItem;
};

const StaticTime: Component<StaticTimeProps> = (props) => {
  return <span class="grow">{formatTime(props.item.startValue)}</span>;
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
            <Show
              when={isCurrentRunning()}
              fallback={<StaticTime item={item()} />}
            >
              <TrackingTime item={item()} />
            </Show>
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
