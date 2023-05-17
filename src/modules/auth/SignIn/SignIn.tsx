import { useI18n } from "@solid-primitives/i18n";
import { Show, type Component } from "solid-js";
import { Alert, AlertIcon } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Card, CardBody, cardTitleClass } from "~/components/Card";
import {
  TextFieldDescription,
  TextFieldInput,
  TextFieldLabel,
  TextFieldLabelText,
  TextFieldRoot,
} from "~/components/TextField";
import { createSignInServerAction } from "~/server/auth";

export const SignIn: Component = () => {
  const [t] = useI18n();

  const [signOut, { Form }] = createSignInServerAction();

  return (
    <Card variant="bordered" class="w-full max-w-md">
      <CardBody>
        <h2 class={cardTitleClass()}>{t("signIn.title")}</h2>
        <Form class="flex flex-col gap-4">
          <Show when={signOut.error}>
            {(error) => (
              <Alert variant="error">
                <AlertIcon variant="error" />
                {error().message}
              </Alert>
            )}
          </Show>
          <TextFieldRoot>
            <TextFieldLabel for="token">
              <TextFieldLabelText>{t("signIn.label")}</TextFieldLabelText>
            </TextFieldLabel>
            <TextFieldInput
              id="token"
              name="token"
              type="password"
              variant="bordered"
              placeholder={t("signIn.placeholder")}
            />
            <TextFieldDescription>
              {t("signIn.description", {}, "")}
            </TextFieldDescription>
          </TextFieldRoot>
          <Button
            disabled={signOut.pending}
            isLoading={signOut.pending}
            type="submit"
            color="none"
          >
            {t("signIn.button")}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};
