import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { IoPencilSharp, IoReloadSharp, IoSaveSharp } from "solid-icons/io";
import { Show, createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { showToast } from "~/components/Toast";
import {
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
  type UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import type { IssueEssentials, TimeEntry } from "~/server/types";
import { CardHeader } from "../CardHeader";
import { UpdatedCardMenu } from "../CardMenu";
import { useTimeSheetContext } from "../EntriesStore";
import { TimeEntryFields } from "../TimeEntryFields";
import { TrackingRow } from "../TrackingToolbar";

type UpdateFormProps = {
  args: UpdateTimeEntryArgs;
  isPending: boolean;
};

const UpdateForm: Component<UpdateFormProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onCommentsChange = (comments: string) => {
    setState("updateMap", props.args.id, "args", "comments", comments);
  };

  const onHoursChange = (hours: number) => {
    setState("updateMap", props.args.id, "args", "hours", hours);
  };

  return (
    <TimeEntryFields
      data={props.args}
      isLoading={props.isPending}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
    />
  );
};

type CardContentProps = {
  entry: TimeEntry;
  isPending: boolean;
  onUpdateClick: () => void;
};

const CardContent: Component<CardContentProps> = (props) => {
  const [t] = useI18n();

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.hours.label")}
        </span>
        <span class="px-2 py-1 text-xs">{props.entry.hours}</span>
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.comments.label")}
        </span>
        <span class="px-2 py-1 text-xs">{props.entry.comments}</span>
      </div>
      <div class="flex justify-end">
        <Button
          disabled={props.isPending}
          onClick={props.onUpdateClick}
          size="xs"
          variant="outline"
        >
          <IoPencilSharp />
          {t("dashboard.timeEntry.update")}
        </Button>
      </div>
    </div>
  );
};

type SaveButtonProps = {
  args: UpdateTimeEntryArgs;
  isPending: boolean;
};

const SaveButton: Component<SaveButtonProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

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
      setState("updateMap", props.args.id, undefined);
      showToast({
        description: t("dashboard.toasts.updated"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onSaveClick = () => {
    mutation.mutate(props.args);
  };

  return (
    <Button
      disabled={props.isPending}
      onClick={onSaveClick}
      size="xs"
      variant="outline"
    >
      <IoSaveSharp />
      {t("dashboard.timeEntry.save")}
    </Button>
  );
};

type UpdatedEntryCardProps = {
  entry: TimeEntry;
  issue: IssueEssentials;
};

export const UpdatedEntryCard: Component<UpdatedEntryCardProps> = (props) => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const isMutating = useIsMutating();

  const isPending = createMemo(() => {
    return isMutating() > 0;
  });

  const defaultArgs = createMemo(() => {
    return {
      comments: props.entry.comments,
      hours: props.entry.hours,
      id: props.entry.id,
    };
  });

  const entry = createMemo(() => {
    return state.updateMap[props.entry.id];
  });

  const onUpdateClick = () => {
    setState("updateMap", props.entry.id, { args: defaultArgs() });
  };

  const onResetClick = () => {
    setState("updateMap", props.entry.id, undefined);
  };

  return (
    <Card
      color={entry() ? "black" : "disabled"}
      size="compact"
      variant="bordered"
    >
      <CardBody>
        <CardHeader
          isPending={isPending()}
          issue={props.issue}
          menu={
            <UpdatedCardMenu id={props.entry.id} isDisabled={isPending()} />
          }
        />
        <div class="border-y-[1px] border-base-300 py-2">
          <TrackingRow timeEntryId={props.entry.id} />
        </div>
        <Show
          when={entry()}
          fallback={
            <CardContent
              entry={props.entry}
              isPending={isPending()}
              onUpdateClick={onUpdateClick}
            />
          }
        >
          {(entry) => (
            <div class="flex flex-col gap-2">
              <UpdateForm args={entry().args} isPending={isPending()} />
              <div class="flex justify-end gap-2">
                <Button
                  disabled={isPending()}
                  onClick={onResetClick}
                  size="xs"
                  variant="ghost"
                >
                  <IoReloadSharp />
                  {t("dashboard.timeEntry.reset")}
                </Button>
                <SaveButton args={entry().args} isPending={isPending()} />
              </div>
            </div>
          )}
        </Show>
      </CardBody>
    </Card>
  );
};
