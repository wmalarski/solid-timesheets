import { useI18n } from "@solid-primitives/i18n";
import {
  createMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/solid-query";
import { Show, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import {
  createTimeEntriesKey,
  createTimeEntryServerMutation,
  getAllTimeEntriesKey,
  type CreateTimeEntryArgs,
} from "~/server/timeEntries";
import { NewEntryFields } from "../NewEntryFields";
import {
  createdTimeEntriesKey,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type Props = {
  args: CreateTimeEntryArgs;
  index: number;
};

export const NewEntryCard: Component<Props> = (props) => {
  const [t] = useI18n();

  const { setCreatedTimeEntries } = useTimeSheetContext();

  const isMutating = useIsMutating(() => ({
    mutationKey: createTimeEntriesKey(),
  }));

  const key = () => {
    return createdTimeEntriesKey({
      day: props.args.spentOn,
      issueId: props.args.issueId,
    });
  };

  const onDelete = () => {
    const index = props.index;
    setCreatedTimeEntries("map", key(), (current) => {
      const copy = [...current];
      copy.splice(index, 1);
      return copy;
    });
  };

  const onCommentsChange = (comments: string) => {
    setCreatedTimeEntries("map", key(), props.index, "comments", comments);
  };

  const onHoursChange = (hours: number) => {
    setCreatedTimeEntries("map", key(), props.index, "hours", hours);
  };

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntryServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      onDelete();
    },
  }));

  const onSaveClick = () => {
    mutation.mutate(props.args);
  };

  const isPending = () => {
    return isMutating() > 0 || mutation.isPending;
  };

  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <div>
          <Badge class="uppercase" variant="outline">
            <Show fallback={t("dashboard.timeEntry.new")} when={isPending()}>
              {t("dashboard.timeEntry.pending")}
            </Show>
          </Badge>
          <Button
            color="error"
            disabled={isPending()}
            onClick={onDelete}
            size="xs"
            variant="outline"
          >
            {t("dashboard.timeEntry.delete")}
          </Button>
        </div>
        <NewEntryFields
          isLoading={isPending()}
          onCommentChange={onCommentsChange}
          onHoursChange={onHoursChange}
          onSaveClick={onSaveClick}
          value={props.args}
        />
      </CardBody>
    </Card>
  );
};
