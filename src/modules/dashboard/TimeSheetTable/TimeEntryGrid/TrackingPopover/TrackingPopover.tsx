import { createQuery } from "@tanstack/solid-query";
import { IoCloseSharp, IoHourglassSharp } from "solid-icons/io";
import { Show, createMemo, createSignal, type Component } from "solid-js";
import { isServer } from "solid-js/web";
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
import { getIssuesKey, getIssuesServerQuery } from "~/server/issues";
import { useTimeSheetContext } from "../../EntriesStore";
import { useTrackingStoreContext } from "../../TrackingStore";
import { TrackingCard, createTimeCounter } from "../../TrackingToolbar";
import { groupIssues } from "../TimeEntryGrid.utils";

const ClientTrackingPopover: Component = () => {
  const { t } = useI18n();

  const issuesQuery = createQuery(() => ({
    enabled: !isServer,
    queryFn: (context) => getIssuesServerQuery(context.queryKey),
    queryKey: getIssuesKey({
      assignedToId: "me",
      sort: "project",
      statusId: "open",
    }),
  }));

  const issuesMap = createMemo(() =>
    groupIssues(issuesQuery.data?.issues || [])
  );

  const { state } = useTimeSheetContext();
  const { runningId, items } = useTrackingStoreContext();

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

    return issuesMap().get(entry.issueId) || null;
  });

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

export const TrackingPopover: Component = () => {
  return (
    <ClientOnly>
      <ClientTrackingPopover />
    </ClientOnly>
  );
};
