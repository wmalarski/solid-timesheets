import { useI18n } from "@solid-primitives/i18n";
import { type Component } from "solid-js";
import {
  TextFieldInput,
  TextFieldLabel,
  TextFieldRoot,
  type TextFieldInputProps,
} from "~/components/TextField";

export type NewEntryFormData = {
  comments: string;
  hours: number;
};

type TimeEntryFormProps = {
  value: NewEntryFormData;
  isLoading?: boolean;
  onCommentChange: (comment: string) => void;
  onHoursChange: (hours: number) => void;
};

export const NewEntryForm: Component<TimeEntryFormProps> = (props) => {
  const [t] = useI18n();

  const onCommentsInput: TextFieldInputProps["onInput"] = (event) => {
    props.onCommentChange(event.target.value);
  };

  const onHoursInput: TextFieldInputProps["onInput"] = (event) => {
    props.onHoursChange(event.target.valueAsNumber);
  };

  return (
    <div class="flex flex-col">
      <TextFieldRoot>
        <TextFieldLabel for="comments">
          {t("dashboard.timeEntry.comments.label")}
        </TextFieldLabel>
        <TextFieldInput
          disabled={props.isLoading}
          name="comments"
          onInput={onCommentsInput}
          placeholder={t("dashboard.timeEntry.comments.placeholder")}
          size="xs"
          type="text"
          value={props.value.comments}
          variant="bordered"
        />
      </TextFieldRoot>

      <TextFieldRoot>
        <TextFieldLabel for="hours">
          {t("dashboard.timeEntry.hours.label")}
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
          value={props.value.hours}
          variant="bordered"
        />
      </TextFieldRoot>
    </div>
  );
};
