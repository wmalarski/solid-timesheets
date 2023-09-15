import { Show, type Component } from "solid-js";
import { Alert, AlertIcon } from "~/components/Alert";
import {
  TextFieldInput,
  TextFieldLabel,
  TextFieldLabelText,
  TextFieldRoot,
  type TextFieldInputProps,
} from "~/components/TextField";
import { useI18n } from "~/contexts/I18nContext";

type TimeEntryFieldsProps = {
  comments?: string;
  error?: string;
  hours?: number;
  isLoading?: boolean;
  onCommentsChange: FunctionStringCallback;
  onHoursChange: (hours: number) => void;
};

export const TimeEntryFields: Component<TimeEntryFieldsProps> = (props) => {
  const { t } = useI18n();

  const onCommentsInput: TextFieldInputProps["onInput"] = (event) => {
    props.onCommentsChange(event.target.value);
  };

  const onHoursInput: TextFieldInputProps["onInput"] = (event) => {
    props.onHoursChange(event.target.valueAsNumber);
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
          value={props.hours}
          variant="bordered"
        />
      </TextFieldRoot>

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
          value={props.comments}
          variant="bordered"
        />
      </TextFieldRoot>
    </div>
  );
};
