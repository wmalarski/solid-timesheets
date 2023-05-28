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
import {
  useTrackingStoreContext,
  type TrackingItem,
} from "../../TrackingStore";

const secondsToNow = (start: string) => {
  const nowTime = new Date().getTime();
  const startTime = new Date(start).getTime() || 0;

  const diffSeconds = (nowTime - startTime) / 1000;

  return diffSeconds;
};

type TrackingTimeProps = {
  item: TrackingItem;
};

const TrackingTime: Component<TrackingTimeProps> = (props) => {
  const [counter, setCounter] = createSignal(0);

  const interval = setInterval(() => {
    console.log(props.item);
    setCounter(secondsToNow(props.item.startDate));
  }, 1000);

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <pre>
      {JSON.stringify(
        { counter: counter() + props.item.startValue, item: props.item },
        null,
        2
      )}
    </pre>
  );
};

type StaticTimeProps = {
  item: TrackingItem;
};

const StaticTime: Component<StaticTimeProps> = (props) => {
  return <pre>{JSON.stringify({ info: props.item }, null, 2)}</pre>;
};

type TrackingRowProps = {
  timeEntryId: number;
};

export const TrackingRow: Component<TrackingRowProps> = (props) => {
  const [t] = useI18n();

  const { runningId, items, setItem, setRunningId } = useTrackingStoreContext();

  const isCurrentRunning = createMemo(() => {
    return props.timeEntryId === runningId();
  });

  const item = createMemo(() => {
    return items()[props.timeEntryId];
  });

  const onPauseClick = () => {
    const current = item();
    if (!current) {
      return;
    }
    const startValue = current.startValue + secondsToNow(current.startDate);
    const newItem = { startDate: new Date().toJSON(), startValue };
    console.log("pause", { newItem });
    setItem({ item: newItem, trackingId: props.timeEntryId });
    if (isCurrentRunning()) {
      setRunningId(null);
    }
  };

  const onResetClick = () => {
    setItem({ item: undefined, trackingId: props.timeEntryId });
    if (isCurrentRunning()) {
      setRunningId(null);
    }
  };

  const onStartClick = () => {
    const startValue = item()?.startValue || 0;
    const newItem = { startDate: new Date().toJSON(), startValue };
    console.log("pause", { newItem });
    setItem({ item: newItem, trackingId: props.timeEntryId });
    setRunningId(props.timeEntryId);
  };

  const onSaveClick = () => {
    setItem({ item: undefined, trackingId: props.timeEntryId });
    if (isCurrentRunning()) {
      setRunningId(null);
    }
  };

  return (
    <div>
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
              variant="outline"
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
