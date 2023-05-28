import { useI18n } from "@solid-primitives/i18n";
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
import { secondsToNow } from "~/utils/date";
import { formatTime } from "~/utils/format";
import {
  useTrackingStoreContext,
  type TrackingItem,
} from "../../TrackingStore";

type TrackingTimeProps = {
  item: TrackingItem;
};

const TrackingTime: Component<TrackingTimeProps> = (props) => {
  const [counter, setCounter] = createSignal(0);

  const interval = setInterval(() => {
    setCounter(secondsToNow(props.item.startDate));
  }, 1000);

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <span class="grow">{formatTime(counter() + props.item.startValue)}</span>
  );
};

type StaticTimeProps = {
  item: TrackingItem;
};

const StaticTime: Component<StaticTimeProps> = (props) => {
  return <span class="grow">{formatTime(props.item.startValue)}</span>;
};

type ClientProps = {
  timeEntryId: number;
};

export const Client: Component<ClientProps> = (props) => {
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

  const onSaveClick = () => {
    reset(props.timeEntryId);
  };

  return (
    <div class="flex items-center">
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
        <Button
          aria-label={t("dashboard.tracking.stop")}
          onClick={onSaveClick}
          shape="square"
          size="sm"
          variant="outline"
        >
          <IoStopSharp />
        </Button>
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
      <Client timeEntryId={props.timeEntryId} />
    </ClientOnly>
  );
};
