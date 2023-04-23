import { useI18n } from "@solid-primitives/i18n";
import { Show, type Component } from "solid-js";
import { Button } from "~/components/Button";
import { Card, CardBody, cardTitleClass } from "~/components/Card";
import {
  TextFieldDescription,
  TextFieldInput,
  TextFieldLabel,
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
            {(error) => <pre>{JSON.stringify(error(), null, 2)}</pre>}
          </Show>
          <TextFieldRoot>
            <TextFieldLabel for="token">{t("signIn.label")}</TextFieldLabel>
            <TextFieldInput
              id="token"
              name="token"
              variant="bordered"
              placeholder={t("signIn.placeholder")}
            />
            <TextFieldDescription>
              {t("signIn.description")}
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
