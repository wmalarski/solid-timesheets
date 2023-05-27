import { useI18n } from "@solid-primitives/i18n";
import {
  IoPauseSharp,
  IoPlaySharp,
  IoReloadSharp,
  IoStopSharp,
} from "solid-icons/io";
import { Show, createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { useTrackingStoreContext } from "../../TrackingStore";

type TrackingRowProps = {
  timeEntryId: number;
};

export const TrackingRow: Component<TrackingRowProps> = (props) => {
  const [t] = useI18n();

  const { runningId, items } = useTrackingStoreContext();

  const isCurrentRunning = createMemo(() => {
    return props.timeEntryId === runningId();
  });

  const info = createMemo(() => {
    return items()[props.timeEntryId];
  });

  const onPauseClick = () => {
    //
  };

  const onResetClick = () => {
    //
  };

  const onStartClick = () => {
    //
  };

  const onSaveClick = () => {
    //
  };

  return (
    <div>
      <pre>
        {JSON.stringify(
          { info: info(), isRunning: isCurrentRunning() },
          null,
          2
        )}
      </pre>
      <Show when={info()}>
        <Button
          aria-label={t("dashboard.tracking.reset")}
          onClick={onResetClick}
          shape="square"
          variant="outline"
        >
          <IoReloadSharp />
        </Button>
      </Show>
      <Show
        when={isCurrentRunning()}
        fallback={
          <Button
            aria-label={t("dashboard.tracking.start")}
            onClick={onStartClick}
            shape="square"
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
          variant="outline"
        >
          <IoPauseSharp />
        </Button>
      </Show>
      <Show when={info()}>
        <Button
          aria-label={t("dashboard.tracking.stop")}
          onClick={onSaveClick}
          shape="square"
          variant="outline"
        >
          <IoStopSharp />
        </Button>
      </Show>
    </div>
  );
};
