import { createQuery } from "@tanstack/solid-query";
import { IoCloseSharp, IoHourglassSharp } from "solid-icons/io";
import { Show, createMemo, createSignal, type Component } from "solid-js";
import { ClientOnly } from "~/components/ClientOnly";
import { Countdown } from "~/components/Countdown";
import {
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/Popover";
import { useI18n } from "~/contexts/I18nContext";
import { getTimeEntryKey, getTimeEntryServerQuery } from "~/server/timeEntries";
import { useTrackingStoreContext } from "../../TrackingStore";
import { TrackingCard, createTimeCounter } from "../../TrackingToolbar";

type TrackingPopoverContentProps = {
  timeEntryId: number;
};

const TrackingPopoverContent: Component<TrackingPopoverContentProps> = (
  props
) => {
  const timeEntryQuery = createQuery(() => ({
    queryFn: (context) => getTimeEntryServerQuery(context.queryKey),
    queryKey: getTimeEntryKey({ id: props.timeEntryId }),
  }));

  return (
    <PopoverPortal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>
          <PopoverTitle>
            {timeEntryQuery.data?.time_entry.project.name}
          </PopoverTitle>
          <PopoverCloseButton>
            <IoCloseSharp />
          </PopoverCloseButton>
        </PopoverHeader>
        <PopoverDescription>
          {timeEntryQuery.data?.time_entry.comments}
        </PopoverDescription>
        <TrackingCard timeEntryId={props.timeEntryId} />
      </PopoverContent>
    </PopoverPortal>
  );
};

const ClientTrackingPopover: Component = () => {
  const { t } = useI18n();

  const { runningId, items } = useTrackingStoreContext();

  const [isOpen, setIsOpen] = createSignal(false);

  const item = createMemo(() => {
    const current = runningId();
    if (!current) {
      return;
    }
    return items()[current];
  });

  const isRunning = createMemo(() => {
    return Boolean(runningId());
  });

  const counter = createTimeCounter({ isRunning, item });

  return (
    <PopoverRoot open={isOpen() && isRunning()} onOpenChange={setIsOpen}>
      <PopoverTrigger size="sm" disabled={!isRunning()}>
        <IoHourglassSharp />
        <span class="hidden sm:block">
          <Show when={isRunning()} fallback={t("dashboard.tracking.button")}>
            <Countdown seconds={counter()} />
          </Show>
        </span>
      </PopoverTrigger>
      <Show when={runningId()}>
        {(runningId) => <TrackingPopoverContent timeEntryId={runningId()} />}
      </Show>
    </PopoverRoot>
  );
};

export const TrackingPopover: Component = () => {
  return (
    <ClientOnly>
      <ClientTrackingPopover />
    </ClientOnly>
  );
};
