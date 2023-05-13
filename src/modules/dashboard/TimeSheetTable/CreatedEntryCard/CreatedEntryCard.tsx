import { useI18n } from "@solid-primitives/i18n";
import { useIsMutating } from "@tanstack/solid-query";
import { Show, createMemo, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { Checkbox } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { TimeEntryFields } from "../TimeEntryFields";
import {
  deleteSheetEntry,
  toggleCheckedSheetEntry,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type CardHeaderProps = {
  args: CreateTimeEntryArgs;
  id: number;
  isChecked: boolean;
  isPending: boolean;
};

const CardHeader: Component<CardHeaderProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onCheckChange = () => {
    toggleCheckedSheetEntry({ id: props.id, setState });
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
          checked={props.isChecked}
          onChange={onCheckChange}
          size="xs"
        />
      </TextFieldLabel>
    </TextFieldRoot>
  );
};

type CreateFormProps = {
  args: CreateTimeEntryArgs;
  id: number;
  isPending: boolean;
};

const CreateForm: Component<CreateFormProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onCommentsChange = (comments: string) => {
    setState("createMap", props.id, "comments", comments);
  };

  const onHoursChange = (hours: number) => {
    setState("createMap", props.id, "hours", hours);
  };

  return (
    <TimeEntryFields
      isLoading={props.isPending}
      data={props.args}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
    />
  );
};

type Props = {
  args: CreateTimeEntryArgs;
  id: number;
};

export const CreatedEntryCard: Component<Props> = (props) => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const isMutating = useIsMutating();

  const isPending = () => {
    return isMutating() > 0;
  };

  const isChecked = createMemo(() => {
    return state.checked.includes(props.id);
  });

  const onDelete = () => {
    deleteSheetEntry({ id: props.id, setState });
  };

  return (
    <Card
      color={isChecked() ? "accent" : "disabled"}
      variant="bordered"
      size="compact"
    >
      <CardBody>
        <CardHeader
          args={props.args}
          id={props.id}
          isChecked={isChecked()}
          isPending={isPending()}
        />
        <CreateForm args={props.args} id={props.id} isPending={isPending()} />
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
