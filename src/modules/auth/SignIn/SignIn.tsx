import { useI18n } from "@solid-primitives/i18n";
import { Show, type Component } from "solid-js";
import { Button } from "~/components/Button";
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
    <Form>
      <Show when={signOut.error}>
        {(error) => <pre>{JSON.stringify(error(), null, 2)}</pre>}
      </Show>
      <TextFieldRoot>
        <TextFieldLabel for="token">{t("signIn.label")}</TextFieldLabel>
        <TextFieldInput
          id="token"
          name="token"
          placeholder={t("signIn.placeholder")}
        />
        <TextFieldDescription>{t("signIn.description")}</TextFieldDescription>
      </TextFieldRoot>
      <Button
        isDisabled={signOut.pending}
        isLoading={signOut.pending}
        type="submit"
      >
        {t("signIn.button")}
      </Button>
    </Form>
  );
};
