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
    <Form onSubmit={props.onSubmit}>
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

      <div class="flex justify-end">
        <Button
          onClick={props.onReset}
          variant="outline"
          size="xs"
          color="error"
          type="reset"
          isLoading={props.isLoading}
          disabled={props.isLoading}
        >
          {t("dashboard.timeEntry.cancel")}
        </Button>
        <Button variant="outline" size="xs" color="success" type="submit">
          {t("dashboard.timeEntry.save")}
        </Button>
      </div>
    </Form>
  );
};
