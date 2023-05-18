import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { showToast } from "~/components/Toast";
import {
  createTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import type { Issue } from "~/server/types";
import { CardHeader } from "../CardHeader";
import { CreatedCardMenu } from "../CardMenu";
import { TimeEntryFields } from "../TimeEntryFields";
import {
  sheetEntryMapKey,
  useTimeSheetContext,
  type CreatingEntryData,
} from "../TimeSheetTable.utils";

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

  return (
    <TimeEntryFields
      data={props.entry.args}
      isLoading={props.isPending}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
    />
  );
};

type SaveButtonProps = {
  entry: CreatingEntryData;
  isPending: boolean;
  key: string;
};

const SaveButton: Component<SaveButtonProps> = (props) => {
  const [t] = useI18n();

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
      ✅ {t("dashboard.timeEntry.save")}
    </Button>
  );
};

type Props = {
  entry: CreatingEntryData;
  issue: Issue;
};

export const CreatedEntryCard: Component<Props> = (props) => {
  const [t] = useI18n();

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
    <Card color="accent" variant="bordered" size="compact">
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
        <CreateForm entry={props.entry} key={key()} isPending={isPending()} />
        <div class="flex justify-end gap-2">
          <Button
            disabled={isPending()}
            onClick={onDelete}
            size="xs"
            variant="outline"
          >
            ❌ {t("dashboard.timeEntry.delete")}
          </Button>
          <SaveButton entry={props.entry} isPending={isPending()} key={key()} />
        </div>
      </CardBody>
    </Card>
  );
};
