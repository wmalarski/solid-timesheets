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
import { Checkbox } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
import {
  createTimeEntriesKey,
  createTimeEntryServerMutation,
  getAllTimeEntriesKey,
  type CreateTimeEntryArgs,
} from "~/server/timeEntries";
import { NewEntryFields } from "../NewEntryFields";
import {
  copyTimeEntryToEndOfMonth,
  copyTimeEntryToNextDay,
  timeEntryMapKey,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";
import { deleteFromStore } from "./NewEntryCard.utils";

type CardHeaderProps = {
  args: CreateTimeEntryArgs;
  index: number;
  isChecked: boolean;
  isPending: boolean;
};

const CardHeader: Component<CardHeaderProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const onDelete = () => {
    deleteFromStore({ args: props.args, index: props.index, setState });
  };

  const onCopyEndMonth = () => {
    copyTimeEntryToEndOfMonth({ args: props.args, setState });
  };

  const onCopyNextDay = () => {
    copyTimeEntryToNextDay({ args: props.args, setState });
  };

  const onCheckChange = () => {
    const key = timeEntryMapKey({
      date: props.args.spentOn,
      issueId: props.args.issueId,
    });

    setState("map", key, props.index, "isChecked", (current) => !current);
  };

  return (
    <div>
      <TextFieldRoot>
        <TextFieldLabel>
          <Badge class="uppercase" variant="outline">
            <Show
              fallback={t("dashboard.timeEntry.new")}
              when={props.isPending}
            >
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
      <Button
        color="error"
        disabled={props.isPending}
        onClick={onDelete}
        size="xs"
        variant="outline"
      >
        {t("dashboard.timeEntry.delete")}
      </Button>
      <Button
        color="success"
        disabled={props.isPending}
        onClick={onCopyEndMonth}
        size="xs"
        variant="outline"
      >
        {t("dashboard.timeEntry.copyMonthEnd")}
      </Button>
      <Button
        color="success"
        disabled={props.isPending}
        onClick={onCopyNextDay}
        size="xs"
        variant="outline"
      >
        {t("dashboard.timeEntry.copyNextDay")}
      </Button>
    </div>
  );
};

type Props = {
  args: CreateTimeEntryArgs;
  index: number;
  isChecked: boolean;
};

export const NewEntryCard: Component<Props> = (props) => {
  const { setState } = useTimeSheetContext();

  const isMutating = useIsMutating(() => ({
    mutationKey: createTimeEntriesKey(),
  }));

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: createTimeEntryServerMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      deleteFromStore({ args: props.args, index: props.index, setState });
    },
  }));

  const onSaveClick = () => {
    mutation.mutate(props.args);
  };

  const isPending = () => {
    return isMutating() > 0 || mutation.isPending;
  };

  return (
    <Card
      color={props.isChecked ? "accent" : "disabled"}
      variant="bordered"
      size="compact"
    >
      <CardBody>
        <CardHeader
          isChecked={props.isChecked}
          args={props.args}
          index={props.index}
          isPending={isPending()}
        />
        <NewEntryFields
          isLoading={isPending()}
          onSaveClick={onSaveClick}
          args={props.args}
          index={props.index}
          error={mutation.error?.message}
        />
      </CardBody>
    </Card>
  );
};
