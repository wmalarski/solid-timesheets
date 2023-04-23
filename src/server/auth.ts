import { createCookieSessionStorage } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { z } from "zod";
import { paths } from "~/utils/paths";
import { serverEnv } from "./env";
import { zodFormParse } from "./utils";

const storage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    name: "session",
    path: "/",
    sameSite: "lax",
    secrets: [serverEnv.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const tokenKey = "token";

export type Session = {
  token: string;
};

const getTokenFromCookie = async (
  request: Request
): Promise<Session | null> => {
  const session = await storage.getSession(request.headers.get("Cookie"));

  const parsed = z.string().safeParse(session.get(tokenKey));

  if (parsed.success) {
    return { token: parsed.data };
  }

  return null;
};

export const getSession = (request: Request): Promise<Session | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unsafeRequest = request as any;

  if (!unsafeRequest?.sessionPromise) {
    unsafeRequest.sessionPromise = getTokenFromCookie(request);
  }

  return unsafeRequest?.sessionPromise;
};

const signInArgsSchema = z.object({
  token: z.string(),
});

export const createSignInServerAction = () => {
  return createServerAction$(async (form: FormData, { request }) => {
    const parsed = await zodFormParse({ form, schema: signInArgsSchema });

    const session = await storage.getSession(request.headers.get("Cookie"));

    session.set(tokenKey, parsed.token);

    return redirect(paths.timeSheets, {
      headers: { "Set-Cookie": await storage.commitSession(session) },
    });
  });
};

export const createSignOutServerAction = () => {
  return createServerAction$(async (_form: FormData, { request }) => {
    const session = await storage.getSession(request.headers.get("Cookie"));

    return redirect(paths.home, {
      headers: { "Set-Cookie": await storage.destroySession(session) },
    });
  });
};
