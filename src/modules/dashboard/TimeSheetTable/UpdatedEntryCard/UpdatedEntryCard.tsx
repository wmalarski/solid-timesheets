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
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
  type UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import type { TimeEntry } from "~/server/types";
import { TimeEntryFields } from "../TimeEntryFields";
import { useTimeSheetContext } from "../TimeSheetTable.utils";

type CardHeaderProps = {
  entry: TimeEntry;
  isChecked: boolean;
  isPending: boolean;
};

const CardHeader: Component<CardHeaderProps> = (props) => {
  const { setState } = useTimeSheetContext();

  const onCheckChange = () => {
    setState("updateMap", props.entry.id, (current) => ({
      isChecked: !current?.isChecked,
    }));
  };

  return (
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
  );
};

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
          {t("dashboard.timeEntry.comments.label")}
        </span>
        <span class="px-3 py-1 text-xs">{props.entry.comments}</span>
        <span class="select-none px-1 py-2">
          {t("dashboard.timeEntry.hours.label")}
        </span>
        <span class="px-3 py-1 text-xs">{props.entry.hours}</span>
      </div>
      <Button
        color="secondary"
        disabled={props.isPending}
        onClick={props.onUpdateClick}
        size="xs"
      >
        {t("dashboard.timeEntry.update")}
      </Button>
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("updateMap", props.args.id, "isEditing", false);
    },
  }));

  const onSaveClick = () => {
    mutation.mutate(props.args);
  };

  return (
    <Button
      color="error"
      disabled={props.isPending}
      onClick={onSaveClick}
      size="xs"
    >
      {t("dashboard.timeEntry.save")}
    </Button>
  );
};

type UpdatedEntryCardProps = {
  entry: TimeEntry;
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

  const isChecked = createMemo(() => {
    return entry()?.isChecked || false;
  });

  const onUpdateClick = () => {
    setState("updateMap", props.entry.id, {
      args: defaultArgs(),
      isEditing: true,
    });
  };

  const onResetClick = () => {
    setState("updateMap", props.entry.id, {
      args: defaultArgs(),
      isEditing: false,
    });
  };

  return (
    <Card
      color={isChecked() ? "accent" : "disabled"}
      size="compact"
      variant="bordered"
    >
      <CardBody>
        <CardHeader
          entry={props.entry}
          isChecked={isChecked()}
          isPending={isPending()}
        />
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
            <Show
              when={entry().isEditing}
              fallback={
                <CardContent
                  entry={props.entry}
                  isPending={isPending()}
                  onUpdateClick={onUpdateClick}
                />
              }
            >
              <div class="flex flex-col gap-2">
                <UpdateForm args={entry().args} isPending={isPending()} />
                <div class="flex gap-2">
                  <Button
                    color="error"
                    disabled={isPending()}
                    onClick={onResetClick}
                    size="xs"
                  >
                    {t("dashboard.reset")}
                  </Button>
                  <SaveButton args={entry().args} isPending={isPending()} />
                </div>
              </div>
            </Show>
          )}
        </Show>
      </CardBody>
    </Card>
  );
};
