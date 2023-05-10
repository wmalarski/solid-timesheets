import { useI18n } from "@solid-primitives/i18n";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Show, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import { Checkbox } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
import {
  deleteTimeEntryServerMutation,
  getAllTimeEntriesKey,
  type CreateTimeEntryArgs,
  type UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import type { TimeEntry } from "~/server/types";
import { TimeEntryFields } from "../TimeEntryFields";
import {
  copyTimeEntryToEndOfMonth,
  copyTimeEntryToNextDay,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type UpdateFormProps = {
  args: UpdateTimeEntryArgs;
};

const UpdateForm: Component<UpdateFormProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onCommentsChange = (comments: string) => {
    setState("updated", props.args.id, "comments", comments);
  };

  const onHoursChange = (hours: number) => {
    setState("updated", props.args.id, "hours", hours);
  };

  return (
    <TimeEntryFields
      data={props.args}
      onCommentsChange={onCommentsChange}
      onHoursChange={onHoursChange}
      isLoading={false}
    />
  );
};

type CardContentProps = {
  entry: TimeEntry;
  onUpdateClick: () => void;
};

const CardContent: Component<CardContentProps> = (props) => {
  const [t] = useI18n();

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.comments.label")}
        </span>
        <span class="px-3 py-1 text-xs">{props.entry.comments}</span>
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.hours.label")}
        </span>
        <span class="px-3 py-1 text-xs">{props.entry.hours}</span>
      </div>
      <Button onClick={props.onUpdateClick} size="xs" color="secondary">
        {t("dashboard.timeEntry.update")}
      </Button>
    </div>
  );
};

type CardHeaderProps = {
  entry: TimeEntry;
  isChecked: boolean;
};

const CardHeader: Component<CardHeaderProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: deleteTimeEntryServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
    },
  }));

  const onDeleteClick = () => {
    mutation.mutate({ id: props.entry.id });
  };

  const args = (): CreateTimeEntryArgs => {
    return {
      activityId: props.entry.activity.id,
      comments: props.entry.comments,
      hours: props.entry.hours,
      issueId: props.entry.issue.id,
      spentOn: new Date(props.entry.spent_on),
    };
  };

  const onCopyEndMonth = () => {
    copyTimeEntryToEndOfMonth({ args: args(), setState });
  };

  const onCopyNextDay = () => {
    copyTimeEntryToNextDay({ args: args(), setState });
  };

  const onCheckChange = () => {
    const id = props.entry.id;
    setState("checked", (current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    );
  };

  return (
    <div>
      <TextFieldRoot>
        <TextFieldLabel>
          <Badge variant="outline">{props.entry.id}</Badge>
          <Checkbox
            checked={props.isChecked}
            onChange={onCheckChange}
            size="xs"
          />
        </TextFieldLabel>
      </TextFieldRoot>
      <Button
        color="error"
        disabled={mutation.isPending}
        onClick={onDeleteClick}
        size="xs"
        variant="outline"
      >
        {t("dashboard.timeEntry.delete")}
      </Button>
      <Button
        color="success"
        disabled={mutation.isPending}
        onClick={onCopyEndMonth}
        size="xs"
        variant="outline"
      >
        {t("dashboard.timeEntry.copyMonthEnd")}
      </Button>
      <Button
        color="success"
        disabled={mutation.isPending}
        onClick={onCopyNextDay}
        size="xs"
        variant="outline"
      >
        {t("dashboard.timeEntry.copyNextDay")}
      </Button>
    </div>
  );
};

type TimeEntryCardProps = {
  entry: TimeEntry;
};

export const TimeEntryCard: Component<TimeEntryCardProps> = (props) => {
  const [t] = useI18n();

  const { state, setState } = useTimeSheetContext();

  const args = () => {
    return state.updated[props.entry.id];
  };

  const isChecked = () => {
    return state.checked.includes(props.entry.id);
  };

  const onUpdateClick = () => {
    setState("updated", props.entry.id, {
      comments: props.entry.comments,
      hours: props.entry.hours,
      id: props.entry.id,
    });
  };

  const onSettle = () => {
    setState("updated", props.entry.id, undefined);
  };

  return (
    <Card
      color={isChecked() ? "accent" : "disabled"}
      variant="bordered"
      size="compact"
    >
      <CardBody>
        <CardHeader entry={props.entry} isChecked={isChecked()} />
        <Show
          when={args()}
          fallback={
            <CardContent entry={props.entry} onUpdateClick={onUpdateClick} />
          }
        >
          {(args) => (
            <div class="flex flex-col gap-2">
              <UpdateForm args={args()} />
              <Button color="error" onClick={onSettle} size="xs">
                {t("dashboard.reset")}
              </Button>
            </div>
          )}
        </Show>
      </CardBody>
    </Card>
  );
};
