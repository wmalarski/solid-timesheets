import { createCookieSessionStorage } from "solid-start";
import { z } from "zod";
import { serverEnv } from "./env";
import type { Fetch } from "./fetcher";
import { getMyAccount } from "./myAccount";

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

const getSessionFromCookie = async (
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
    unsafeRequest.sessionPromise = getSessionFromCookie(request);
  }

  return unsafeRequest?.sessionPromise;
};

type SetSessionCookieArgs = {
  fetch: Fetch;
  request: Request;
  token: string;
};

export const setSessionCookie = async ({
  fetch,
  request,
  token,
}: SetSessionCookieArgs) => {
  const session = await storage.getSession(request.headers.get("Cookie"));

  const account = await getMyAccount({ fetch, token });

  console.log({ account });

  session.set(tokenKey, token);

  return storage.commitSession(session);
};

export const destroySessionCookie = async (request: Request) => {
  const session = await storage.getSession(request.headers.get("Cookie"));

  return storage.destroySession(session);
};
