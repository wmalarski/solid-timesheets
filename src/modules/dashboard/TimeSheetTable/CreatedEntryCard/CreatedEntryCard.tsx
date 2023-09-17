import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { IoSaveSharp, IoTrashSharp } from "solid-icons/io";
import { createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { showToast } from "~/components/Toast";
import { useI18n } from "~/contexts/I18nContext";
import {
  createTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import type { Issue, IssueEssentials } from "~/server/types";
import { CardHeader } from "../CardHeader";
import { CreatedCardMenu } from "../CardMenu";
import { DeleteAlertDialog } from "../DeleteAlertDialog";
import {
  sheetEntryMapKey,
  useTimeSheetContext,
  type CreatingEntryData,
} from "../EntriesStore";
import { TimeEntryFields } from "../TimeEntryFields";

type CreateFormProps = {
  entry: CreatingEntryData;
  isPending: boolean;
  issue: IssueEssentials;
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

  return (
    <TimeEntryFields
      comments={props.entry.args.comments}
      hours={props.entry.args.hours}
      isLoading={props.isPending}
      issue={props.issue}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
      onIssueChange={() => void 0}
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
    onError: () => {
      showToast({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("dateMap", props.key, props.entry.id, undefined);
      showToast({
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
  issue: Issue;
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
          isPending={isPending()}
          issue={props.issue}
          menu={
            <CreatedCardMenu
              id={props.entry.id}
              isDisabled={isPending()}
              key={key()}
            />
          }
        />
        <CreateForm
          entry={props.entry}
          key={key()}
          isPending={isPending()}
          issue={props.issue}
        />
        <div class="flex justify-end gap-2">
          <DeleteAlertDialog
            disabled={isPending()}
            onConfirm={onDelete}
            size="xs"
            variant="ghost"
          >
            <IoTrashSharp />
            {t("dashboard.timeEntry.delete")}
          </DeleteAlertDialog>
          <SaveButton entry={props.entry} isPending={isPending()} key={key()} />
        </div>
      </CardBody>
    </Card>
  );
};
