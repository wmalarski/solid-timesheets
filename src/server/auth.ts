import { createServerAction$, redirect } from "solid-start/server";
import { z } from "zod";
import { paths } from "~/utils/paths";
import { destroySessionCookie, setSessionCookie } from "./session";
import { zodFormParse } from "./utils";

const signInArgsSchema = z.object({
  token: z.string(),
});

export const createSignInServerAction = () => {
  return createServerAction$(async (form: FormData, { request, fetch }) => {
    const parsed = await zodFormParse({ form, schema: signInArgsSchema });

    const cookie = await setSessionCookie({
      fetch,
      request,
      token: parsed.token,
    });

    return redirect(paths.timeSheets, { headers: { "Set-Cookie": cookie } });
  });
};

export const createSignOutServerAction = () => {
  return createServerAction$(async (_form: FormData, { request }) => {
    const cookie = await destroySessionCookie(request);

    return redirect(paths.home, { headers: { "Set-Cookie": cookie } });
  });
};
