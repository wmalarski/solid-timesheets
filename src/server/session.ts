import { createCookieSessionStorage } from "solid-start";
import { z } from "zod";
import { serverEnv } from "./env";
import { jsonFetcher, type Fetch } from "./fetcher";
import type { User } from "./types";

const storage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    name: "session",
    path: "/",
    sameSite: "lax",
    secrets: [serverEnv.SESSION_SECRET],
    secure: true,
  },
});

const fullNameKey = "fullName";
const idKey = "id";
const tokenKey = "token";

const sessionSchema = z.object({
  [fullNameKey]: z.string(),
  [idKey]: z.coerce.number(),
  [tokenKey]: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;

const getSessionFromCookie = async (
  request: Request
): Promise<Session | null> => {
  const session = await storage.getSession(request.headers.get("Cookie"));

  const parsed = sessionSchema.safeParse({
    [fullNameKey]: session.get(fullNameKey),
    [idKey]: session.get(idKey),
    [tokenKey]: session.get(tokenKey),
  });

  if (parsed.success) {
    return parsed.data;
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

export const getSessionOrThrow = async (request: Request): Promise<Session> => {
  const session = await getSession(request);

  if (!session) {
    throw { code: 401, message: "Unauthorized" };
  }

  return session;
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

  const data = await jsonFetcher<{ user: User }>({
    fetch,
    path: "/users/current.json",
    token,
  });

  session.set(tokenKey, token);
  session.set(idKey, data.user.id);
  session.set(fullNameKey, `${data.user.firstname} ${data.user.lastname}`);

  return storage.commitSession(session);
};

export const destroySessionCookie = async (request: Request) => {
  const session = await storage.getSession(request.headers.get("Cookie"));

  return storage.destroySession(session);
};
