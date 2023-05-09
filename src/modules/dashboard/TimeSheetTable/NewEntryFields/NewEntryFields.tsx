import { useI18n } from "@solid-primitives/i18n";
import { Show, type Component } from "solid-js";
import { Alert, AlertIcon } from "~/components/Alert";
import { Button } from "~/components/Button";
import {
  TextFieldInput,
  TextFieldLabel,
  TextFieldLabelText,
  TextFieldRoot,
  type TextFieldInputProps,
} from "~/components/TextField";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { timeEntryMapKey, useTimeSheetContext } from "../TimeSheetTable.utils";

type TimeEntryFieldsProps = {
  args: CreateTimeEntryArgs;
  error?: string;
  index: number;
  isLoading?: boolean;
  onSaveClick: () => void;
};

export const NewEntryFields: Component<TimeEntryFieldsProps> = (props) => {
  const [t] = useI18n();

  const { setState } = useTimeSheetContext();

  const key = () => {
    return timeEntryMapKey({
      date: props.args.spentOn,
      issueId: props.args.issueId,
    });
  };

  const onCommentsInput: TextFieldInputProps["onInput"] = (event) => {
    setState("map", key(), props.index, "args", "comments", event.target.value);
  };

  const onHoursInput: TextFieldInputProps["onInput"] = (event) => {
    setState(
      "map",
      key(),
      props.index,
      "args",
      "hours",
      event.target.valueAsNumber
    );
  };

  return (
    <div class="flex flex-col">
      <Show when={props.error}>
        <Alert variant="error">
          <AlertIcon variant="error" />
          {props.error}
        </Alert>
      </Show>

      <TextFieldRoot>
        <TextFieldLabel for="comments">
          <TextFieldLabelText>
            {t("dashboard.timeEntry.comments.label")}
          </TextFieldLabelText>
        </TextFieldLabel>
        <TextFieldInput
          disabled={props.isLoading}
          name="comments"
          onInput={onCommentsInput}
          placeholder={t("dashboard.timeEntry.comments.placeholder")}
          size="xs"
          type="text"
          value={props.args.comments}
          variant="bordered"
        />
      </TextFieldRoot>

      <TextFieldRoot>
        <TextFieldLabel for="hours">
          <TextFieldLabelText>
            {t("dashboard.timeEntry.hours.label")}
          </TextFieldLabelText>
        </TextFieldLabel>
        <TextFieldInput
          disabled={props.isLoading}
          min={0}
          name="hours"
          onInput={onHoursInput}
          placeholder={t("dashboard.timeEntry.hours.placeholder")}
          size="xs"
          step={0.25}
          type="number"
          value={props.args.hours}
          variant="bordered"
        />
      </TextFieldRoot>

      <div class="flex justify-end pt-2">
        <Button
          color="success"
          disabled={props.isLoading}
          isLoading={props.isLoading}
          size="xs"
          type="submit"
          variant="outline"
          onClick={props.onSaveClick}
        >
          {t("dashboard.timeEntry.save")}
        </Button>
      </div>
    </div>
  );
};
