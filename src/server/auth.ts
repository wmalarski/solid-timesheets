import server$, { createServerAction$, redirect } from "solid-start/server";
import { object, parseAsync, regex, string, type Input } from "valibot";
import { paths } from "~/utils/paths";
import { destroySessionCookie, setSessionCookie } from "./session";
import { formParse } from "./utils";

const signInArgsSchema = () => {
  return object({
    token: string([regex(/[a-z0-9]+/g)]),
  });
};

type SignInArgs = Input<ReturnType<typeof signInArgsSchema>>;

export const createSignInServerAction = () => {
  return createServerAction$(async (form: FormData, { env, request }) => {
    const parsed = await formParse({ form, schema: signInArgsSchema() });

    const cookie = await setSessionCookie({
      env,
      request,
      token: parsed.token,
    });

    return redirect(paths.timeSheets, { headers: { "Set-Cookie": cookie } });
  });
};

export const signInServerMutation = server$(async (args: SignInArgs) => {
  const parsed = await parseAsync(signInArgsSchema(), args);

  const cookie = await setSessionCookie({
    env: server$.env,
    request: server$.request,
    token: parsed.token,
  });

  throw redirect(paths.timeSheets, { headers: { "Set-Cookie": cookie } });
});

export const createSignOutServerAction = () => {
  return createServerAction$(async (_form: FormData, { env, request }) => {
    const cookie = await destroySessionCookie({
      env,
      request,
    });

    return redirect(paths.home, { headers: { "Set-Cookie": cookie } });
  });
};
