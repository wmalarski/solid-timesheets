import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { IoSaveSharp, IoTrashSharp } from "solid-icons/io";
import { Suspense, createMemo, lazy, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { showToastAsync } from "~/components/Toast/showToastAsync";
import { useI18n } from "~/contexts/I18nContext";
import {
  createTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import { CardHeader } from "../CardHeader";
import {
  sheetEntryMapKey,
  useTimeSheetContext,
  type CreatingEntryData,
} from "../EntriesStore";
import { TimeEntryFields } from "../TimeEntryFields";

const CreatedCardMenu = lazy(() =>
  import("../CardMenu").then((module) => ({
    default: module.CreatedCardMenu,
  }))
);

const DeleteAlertDialog = lazy(() =>
  import("../DeleteAlertDialog").then((module) => ({
    default: module.DeleteAlertDialog,
  }))
);

type CreateFormProps = {
  entry: CreatingEntryData;
  isPending: boolean;
  key: string;
};

const CreateForm: Component<CreateFormProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onCommentsChange = (comments: string) => {
    setState(
      "dateMap",
      props.key,
      props.entry.id,
      "args",
      "comments",
      comments
    );
  };

  const onHoursChange = (hours: number) => {
    setState("dateMap", props.key, props.entry.id, "args", "hours", hours);
  };

  const onIssueChange = (issueId: number) => {
    setState("dateMap", props.key, props.entry.id, "args", "issueId", issueId);
  };

  return (
    <TimeEntryFields
      comments={props.entry.args.comments}
      hours={props.entry.args.hours}
      isLoading={props.isPending}
      issueId={props.entry.args.issueId}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
      onIssueChange={onIssueChange}
    />
  );
};

type SaveButtonProps = {
  entry: CreatingEntryData;
  isPending: boolean;
  key: string;
};

const SaveButton: Component<SaveButtonProps> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntryServerMutation,
    onError: async () => {
      await showToastAsync({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("dateMap", props.key, props.entry.id, undefined);
      await showToastAsync({
        description: t("dashboard.toasts.create"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onSaveClick = () => {
    mutation.mutate(props.entry.args);
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

type Props = {
  entry: CreatingEntryData;
};

export const CreatedEntryCard: Component<Props> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  const key = () => {
    return sheetEntryMapKey({ date: props.entry.args.spentOn });
  };

  const isMutating = useIsMutating();

  const isPending = createMemo(() => {
    return isMutating() > 0;
  });

  const onDelete = () => {
    setState("dateMap", key(), props.entry.id, undefined);
  };

  return (
    <Card color="black" variant="bordered" size="compact">
      <CardBody>
        <CardHeader
          issueId={props.entry.args.issueId}
          menu={
            <Suspense>
              <CreatedCardMenu
                id={props.entry.id}
                isDisabled={isPending()}
                key={key()}
              />
            </Suspense>
          }
        />
        <CreateForm entry={props.entry} key={key()} isPending={isPending()} />
        <div class="flex justify-end gap-2">
          <Suspense>
            <DeleteAlertDialog
              disabled={isPending()}
              onConfirm={onDelete}
              size="xs"
              variant="ghost"
            >
              <IoTrashSharp />
              {t("dashboard.timeEntry.delete")}
            </DeleteAlertDialog>
          </Suspense>
          <SaveButton entry={props.entry} isPending={isPending()} key={key()} />
        </div>
      </CardBody>
    </Card>
  );
};
