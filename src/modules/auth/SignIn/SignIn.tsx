import { createMutation } from "@tanstack/solid-query";
import { Show, type Component, type JSX, type ParentProps } from "solid-js";
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
import { ThemeSwitch } from "~/components/ThemeSwitch";
import { useI18n } from "~/contexts/I18nContext";
import { createSignInServerAction, signInServerMutation } from "~/server/auth";

const FormWrapper: Component<ParentProps> = (props) => {
  const { t } = useI18n();

  return (
    <Card variant="bordered" class="w-full max-w-md">
      <CardBody>
        <header class="flex items-center justify-between gap-2">
          <h2 class={cardTitleClass()}>{t("signIn.title")}</h2>
          <ThemeSwitch />
        </header>
        {props.children}
      </CardBody>
    </Card>
  );
};

type FormContentProps = {
  error?: Error | null;
  pending: boolean;
};

const FormContent: Component<FormContentProps> = (props) => {
  const { t } = useI18n();

  return (
    <>
      <Show when={props.error}>
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
        <TextFieldDescription>{t("signIn.description")}</TextFieldDescription>
      </TextFieldRoot>
      <Button disabled={props.pending} isLoading={props.pending} type="submit">
        {t("signIn.button")}
      </Button>
    </>
  );
};

export const SignIn: Component = () => {
  const [signOut, { Form }] = createSignInServerAction();

  return (
    <FormWrapper>
      <Form class="flex flex-col gap-4">
        <FormContent pending={signOut.pending} error={signOut.error} />
      </Form>
    </FormWrapper>
  );
};

export const SignInAlternative: Component = () => {
  // const navigate = useNavigate();

  const mutation = createMutation(() => ({
    mutationFn: signInServerMutation,
    onSuccess: () => {
      // navigate is not working here for some reason
      // navigate(paths.timeSheets);
      window.location.reload();
    },
  }));

  const onSubmit: JSX.IntrinsicElements["form"]["onSubmit"] = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const token = form.get("token") as string;
    mutation.mutate({ token });
  };

  return (
    <FormWrapper>
      <form onSubmit={onSubmit} method="post" class="flex flex-col gap-4">
        <FormContent pending={mutation.isPending} error={mutation.error} />
      </form>
    </FormWrapper>
  );
};
