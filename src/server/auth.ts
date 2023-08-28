import { createServerAction$, redirect } from "solid-start/server";
import { object, string } from "valibot";
import { paths } from "~/utils/paths";
import { destroySessionCookie, setSessionCookie } from "./session";
import { formParse } from "./utils";

const signInArgsSchema = () => {
  return object({
    token: string(),
  });
};

export const createSignInServerAction = () => {
  return createServerAction$(
    async (form: FormData, { env, fetch, request }) => {
      const parsed = await formParse({ form, schema: signInArgsSchema() });

      const cookie = await setSessionCookie({
        env,
        fetch,
        request,
        token: parsed.token,
      });

      return redirect(paths.timeSheets, { headers: { "Set-Cookie": cookie } });
    }
  );
};

export const createSignOutServerAction = () => {
  return createServerAction$(async (_form: FormData, { env, request }) => {
    const cookie = await destroySessionCookie({
      env,
      request,
    });

    return redirect(paths.home, { headers: { "Set-Cookie": cookie } });
  });
};
