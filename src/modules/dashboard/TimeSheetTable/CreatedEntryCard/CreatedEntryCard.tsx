import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { Show, createMemo, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { Checkbox } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
import {
  createTimeEntryServerMutation,
  getAllTimeEntriesKey,
} from "~/server/timeEntries";
import { TimeEntryFields } from "../TimeEntryFields";
import {
  sheetEntryMapKey,
  useTimeSheetContext,
  type CreatingEntryData,
} from "../TimeSheetTable.utils";

type CardHeaderProps = {
  entry: CreatingEntryData;
  isPending: boolean;
  key: string;
};

const CardHeader: Component<CardHeaderProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onCheckChange = () => {
    setState(
      "dateMap",
      props.key,
      props.entry.id,
      "isChecked",
      (current) => !current
    );
  };

  return (
    <TextFieldRoot>
      <TextFieldLabel>
        <Badge class="uppercase" variant="outline">
          <Show fallback={t("dashboard.timeEntry.new")} when={props.isPending}>
            {t("dashboard.timeEntry.pending")}
          </Show>
        </Badge>
        <Checkbox
          checked={props.entry.isChecked}
          onChange={onCheckChange}
          size="xs"
        />
      </TextFieldLabel>
    </TextFieldRoot>
  );
};

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("dateMap", props.key, props.entry.id, undefined);
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
};

export const CreatedEntryCard: Component<Props> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const key = () => {
    return sheetEntryMapKey({
      date: props.entry.args.spentOn,
      issueId: props.entry.args.issueId,
    });
  };

  const isMutating = useIsMutating();

  const isPending = createMemo(() => {
    return isMutating() > 0;
  });

  const isChecked = createMemo(() => {
    return props.entry.isChecked;
  });

  const onDelete = () => {
    setState("dateMap", key(), props.entry.id, undefined);
  };

  return (
    <Card
      color={isChecked() ? "accent" : "disabled"}
      variant="bordered"
      size="compact"
    >
      <CardBody>
        <CardHeader entry={props.entry} key={key()} isPending={isPending()} />
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
