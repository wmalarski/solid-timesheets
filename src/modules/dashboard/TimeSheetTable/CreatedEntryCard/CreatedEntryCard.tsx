import { useI18n } from "@solid-primitives/i18n";
import { useIsMutating } from "@tanstack/solid-query";
import { Show, createMemo, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { Checkbox } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
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
      isLoading={props.isPending}
      data={props.entry.args}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
    />
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

  const isPending = () => {
    return isMutating() > 0;
  };

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
        <Button
          color="error"
          disabled={isPending()}
          onClick={onDelete}
          size="xs"
        >
          {t("dashboard.timeEntry.delete")}
        </Button>
      </CardBody>
    </Card>
  );
};
