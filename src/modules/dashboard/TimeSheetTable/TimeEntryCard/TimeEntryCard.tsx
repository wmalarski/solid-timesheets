import { useI18n } from "@solid-primitives/i18n";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Show, createSignal, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import {
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
} from "~/server/timeEntries";
import type { TimeEntry } from "~/server/types";
import { TimeEntryForm, type TimeEntryFormData } from "../TimeEntryForm";

type UpdateFormProps = {
  entry: TimeEntry;
  onSettle: () => void;
};

const UpdateForm: Component<UpdateFormProps> = (props) => {
  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: updateTimeEntryServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      props.onSettle();
    },
  }));

  const onSubmit = (data: TimeEntryFormData) => {
    mutation.mutate({ id: props.entry.id, ...data });
  };

  return (
    <TimeEntryForm
      initialValues={props.entry}
      onReset={props.onSettle}
      onSubmit={onSubmit}
      error={mutation.error?.message}
      isLoading={mutation.isPending}
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
      <div class="flex justify-end">
        <Button
          onClick={props.onUpdateClick}
          variant="outline"
          size="xs"
          color="accent"
        >
          {t("dashboard.timeEntry.update")}
        </Button>
      </div>
    </div>
  );
};

type CardHeaderProps = {
  entry: TimeEntry;
};

const CardHeader: Component<CardHeaderProps> = (props) => {
  return <Badge variant="outline">{props.entry.id}</Badge>;
};

type TimeEntryCardProps = {
  entry: TimeEntry;
};

export const TimeEntryCard: Component<TimeEntryCardProps> = (props) => {
  const [isUpdating, setIsUpdating] = createSignal(false);

  const onUpdateToggle = () => {
    setIsUpdating((current) => !current);
  };

  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <CardHeader entry={props.entry} />
        <Show
          when={!isUpdating()}
          fallback={
            <UpdateForm entry={props.entry} onSettle={onUpdateToggle} />
          }
        >
          <CardContent entry={props.entry} onUpdateClick={onUpdateToggle} />
        </Show>
      </CardBody>
    </Card>
  );
};
