import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { Show, createMemo, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import {
  getAllTimeEntriesKey,
  updateTimeEntryServerMutation,
  type UpdateTimeEntryArgs,
} from "~/server/timeEntries";
import type { Issue, Project, TimeEntry } from "~/server/types";
import { CardHeader } from "../CardHeader";
import { TimeEntryFields } from "../TimeEntryFields";
import { useTimeSheetContext } from "../TimeSheetTable.utils";

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
      <div class="flex justify-end">
        <Button
          disabled={props.isPending}
          onClick={props.onUpdateClick}
          size="xs"
          variant="outline"
        >
          📝 {t("dashboard.timeEntry.update")}
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
      disabled={props.isPending}
      onClick={onSaveClick}
      size="xs"
      variant="outline"
    >
      ✅ {t("dashboard.timeEntry.save")}
    </Button>
  );
};

type UpdatedEntryCardProps = {
  entry: TimeEntry;
  issue: Issue;
  project: Project;
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

  const onCheckChange = (isChecked: boolean) => {
    setState("updateMap", props.entry.id, "isChecked", isChecked);
  };

  return (
    <Card
      color={isChecked() ? "accent" : "disabled"}
      size="compact"
      variant="bordered"
    >
      <CardBody>
        <CardHeader
          isChecked={isChecked()}
          isPending={isPending()}
          issue={props.issue}
          onChange={onCheckChange}
          project={props.project}
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
                <div class="flex justify-end gap-2">
                  <Button
                    disabled={isPending()}
                    onClick={onResetClick}
                    size="xs"
                    variant="outline"
                  >
                    🔄 {t("dashboard.reset")}
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
