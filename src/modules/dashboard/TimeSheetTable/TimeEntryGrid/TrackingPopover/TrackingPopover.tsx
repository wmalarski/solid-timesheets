import { useI18n } from "@solid-primitives/i18n";
import { IoCloseSharp, IoHourglassSharp } from "solid-icons/io";
import { Show, createMemo, createSignal, type Component } from "solid-js";
import { ClientOnly } from "~/components/ClientOnly";
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
import type { Issue } from "~/server/types";
import { useTimeSheetContext } from "../../EntriesStore";
import { useTrackingStoreContext } from "../../TrackingStore";
import { TrackingCard } from "../../TrackingToolbar";

type ClientTrackingPopoverProps = {
  issuesMap: Map<number, Issue>;
};

const ClientTrackingPopover: Component<ClientTrackingPopoverProps> = (
  props
) => {
  const [t] = useI18n();

  const { state } = useTimeSheetContext();
  const { runningId } = useTrackingStoreContext();

  const [isOpen, setIsOpen] = createSignal(false);

  const issue = createMemo(() => {
    const current = runningId();
    if (!current) {
      return null;
    }

    const entry = state.timeEntryMap.get(current);
    if (!entry) {
      return null;
    }

    return props.issuesMap?.get(entry.issueId) || null;
  });

  return (
    <PopoverRoot
      open={isOpen() && Boolean(runningId())}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger size="sm" disabled={!runningId()}>
        <IoHourglassSharp />
        <span class="hidden sm:block">{t("dashboard.tracking.button")}</span>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            <PopoverTitle>{issue()?.project.name}</PopoverTitle>
            <PopoverCloseButton>
              <IoCloseSharp />
            </PopoverCloseButton>
          </PopoverHeader>
          <PopoverDescription>{issue()?.subject}</PopoverDescription>
          <Show when={runningId()}>
            {(runningId) => <TrackingCard timeEntryId={runningId()} />}
          </Show>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  );
};
type TrackingPopoverProps = {
  issuesMap: Map<number, Issue>;
};

export const TrackingPopover: Component<TrackingPopoverProps> = (props) => {
  return (
    <ClientOnly>
      <ClientTrackingPopover issuesMap={props.issuesMap} />
    </ClientOnly>
  );
};
