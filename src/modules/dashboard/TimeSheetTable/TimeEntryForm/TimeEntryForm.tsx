import { createForm, zodForm } from "@modular-forms/solid";
import { useI18n } from "@solid-primitives/i18n";
import { Show, type Component } from "solid-js";
import { z } from "zod";
import { Alert, AlertIcon } from "~/components/Alert";
import { Button } from "~/components/Button";
import {
  TextFieldInput,
  TextFieldLabel,
  TextFieldRoot,
} from "~/components/TextField";

const timeEntryFormSchema = z.object({
  comments: z.string(),
  hours: z.number().min(0),
});

export type TimeEntryFormData = z.infer<typeof timeEntryFormSchema>;

type TimeEntryFormProps = {
  error?: string;
  initialValues?: TimeEntryFormData;
  isLoading: boolean;
  onReset: () => void;
  onSubmit: (data: TimeEntryFormData) => void;
};

export const TimeEntryForm: Component<TimeEntryFormProps> = (props) => {
  const [t] = useI18n();

  const [, { Form, Field }] = createForm<TimeEntryFormData>({
    initialValues: props.initialValues,
    validate: zodForm(timeEntryFormSchema),
  });

  return (
    <Form class="flex flex-col" onSubmit={props.onSubmit}>
      <Show when={props.error}>
        <Alert variant="error">
          <AlertIcon variant="error" />
          {props.error}
        </Alert>
      </Show>

      <Field name="comments" type="string">
        {(field, fieldProps) => (
          <TextFieldRoot>
            <TextFieldLabel for={field.name}>
              {t("dashboard.timeEntry.comments.label")}
            </TextFieldLabel>
            <TextFieldInput
              {...fieldProps}
              disabled={props.isLoading}
              placeholder={t("dashboard.timeEntry.comments.placeholder")}
              size="xs"
              type="text"
              variant="bordered"
            />
            <Show when={field.error}>
              <Alert variant="error">
                <AlertIcon variant="error" />
                {field.error}
              </Alert>
            </Show>
          </TextFieldRoot>
        )}
      </Field>

      <Field name="hours" type="number">
        {(field, fieldProps) => (
          <TextFieldRoot>
            <TextFieldLabel for={field.name}>
              {t("dashboard.timeEntry.hours.label")}
            </TextFieldLabel>
            <TextFieldInput
              {...fieldProps}
              disabled={props.isLoading}
              placeholder={t("dashboard.timeEntry.hours.placeholder")}
              type="number"
              variant="bordered"
              size="xs"
            />
            <Show when={field.error}>
              <Alert variant="error">
                <AlertIcon variant="error" />
                {field.error}
              </Alert>
            </Show>
          </TextFieldRoot>
        )}
      </Field>

      <div class="flex justify-end pt-2">
        <Button
          color="error"
          disabled={props.isLoading}
          isLoading={props.isLoading}
          onClick={props.onReset}
          size="xs"
          type="reset"
          variant="outline"
        >
          {t("dashboard.timeEntry.cancel")}
        </Button>
        <Button
          color="success"
          disabled={props.isLoading}
          isLoading={props.isLoading}
          size="xs"
          type="submit"
          variant="outline"
        >
          {t("dashboard.timeEntry.save")}
        </Button>
      </div>
    </Form>
  );
};
