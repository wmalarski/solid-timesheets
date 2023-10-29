import { createReducer } from "@solid-primitives/memo";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { IoPencilSharp, IoReloadSharp, IoSaveSharp } from "solid-icons/io";
import { Show, Suspense, createMemo, lazy, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { showToastAsync } from "~/components/Toast/showToastAsync";
import { useI18n } from "~/contexts/I18nContext";
import {
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
  type UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import type { TimeEntry } from "~/server/types";
import { CardHeader } from "../CardHeader";
import { useTimeSheetContext, type UpdatingEntryData } from "../EntriesStore";
import { IssueDetails } from "../IssueDetails";
import { TimeEntryFields } from "../TimeEntryFields";
import { TrackingRow } from "../TrackingToolbar";

const DeleteAlertDialog = lazy(() =>
  import("../DeleteAlertDialog").then((module) => ({
    default: module.DeleteAlertDialog,
  }))
);

const UpdatedCardMenu = lazy(() =>
  import("../CardMenu").then((module) => ({
    default: module.UpdatedCardMenu,
  }))
);

type UpdateFormProps = {
  args: UpdateTimeEntryArgs;
  isPending: boolean;
  issueId: number;
};

const UpdateForm: Component<UpdateFormProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onCommentsChange = (comments: string) => {
    setState("updateMap", props.args.id, "args", "comments", comments);
  };

  const onHoursChange = (hours: number) => {
    setState("updateMap", props.args.id, "args", "hours", hours);
  };

  const onIssueChange = (issueId: number) => {
    setState("updateMap", props.args.id, "args", "issueId", issueId);
  };

  return (
    <TimeEntryFields
      comments={props.args.comments}
      hours={props.args.hours}
      isLoading={props.isPending}
      issueId={props.issueId}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
      onIssueChange={onIssueChange}
    />
  );
};

type CardContentProps = {
  entry: TimeEntry;
  isPending: boolean;
  onUpdateClick: VoidFunction;
};

const CardContent: Component<CardContentProps> = (props) => {
  const { t } = useI18n();

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.hours.label")}
        </span>
        <span class="px-2 py-1 text-xs font-bold">{props.entry.hours}</span>
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.comments.label")}
        </span>
        <span class="px-2 py-1 text-xs font-bold">{props.entry.comments}</span>
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
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

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
      setState("updateMap", props.args.id, undefined);
      await showToastAsync({
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

type StaticCardProps = {
  entry: TimeEntry;
};

const StaticCard: Component<StaticCardProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const isMutating = useIsMutating();

  const isPending = createMemo(() => {
    return isMutating() > 0;
  });

  const defaultArgs = createMemo(() => {
    return {
      comments: props.entry.comments,
      hours: props.entry.hours,
      id: props.entry.id,
      issueId: props.entry.issue.id,
    };
  });

  const onUpdateClick = () => {
    setState("updateMap", props.entry.id, { args: defaultArgs() });
  };

  const [isTrackingVisible, toggleIsTrackingVisible] = createReducer(
    (value) => !value,
    false
  );

  return (
    <Card color="disabled" size="compact" variant="bordered">
      <CardBody>
        <CardHeader
          issueId={props.entry.issue.id}
          menu={
            <Suspense>
              <UpdatedCardMenu
                id={props.entry.id}
                isDisabled={isPending()}
                onIsTrackingVisibleToggle={toggleIsTrackingVisible}
              />
            </Suspense>
          }
        />
        <IssueDetails issueId={props.entry.issue.id} />
        <Show when={isTrackingVisible()}>
          <div class="border-y-[1px] border-base-300 py-2">
            <TrackingRow timeEntryId={props.entry.id} />
          </div>
        </Show>
        <CardContent
          entry={props.entry}
          isPending={isPending()}
          onUpdateClick={onUpdateClick}
        />
      </CardBody>
    </Card>
  );
};

type EditingCardProps = {
  entry: TimeEntry;
  data: UpdatingEntryData;
};

const EditingCard: Component<EditingCardProps> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  const isMutating = useIsMutating();

  const isPending = createMemo(() => {
    return isMutating() > 0;
  });

  const onResetClick = () => {
    setState("updateMap", props.entry.id, undefined);
  };

  return (
    <Card color="black" size="compact" variant="bordered">
      <CardBody>
        <CardHeader
          issueId={props.entry.issue.id}
          menu={
            <Suspense>
              <UpdatedCardMenu id={props.entry.id} isDisabled={isPending()} />
            </Suspense>
          }
        />
        <div class="flex flex-col gap-2">
          <UpdateForm
            args={props.data.args}
            isPending={isPending()}
            issueId={props.entry.issue.id}
          />
          <div class="flex justify-end gap-2">
            <Suspense>
              <DeleteAlertDialog
                disabled={isPending()}
                onConfirm={onResetClick}
                size="xs"
                variant="ghost"
              >
                <IoReloadSharp />
                {t("dashboard.timeEntry.reset")}
              </DeleteAlertDialog>
            </Suspense>
            <SaveButton args={props.data.args} isPending={isPending()} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

type UpdatedEntryCardProps = {
  entry: TimeEntry;
};

export const UpdatedEntryCard: Component<UpdatedEntryCardProps> = (props) => {
  const { state } = useTimeSheetContext();

  const data = createMemo(() => {
    return state.updateMap[props.entry.id];
  });

  return (
    <Show when={data()} fallback={<StaticCard entry={props.entry} />}>
      {(data) => <EditingCard data={data()} entry={props.entry} />}
    </Show>
  );
};
