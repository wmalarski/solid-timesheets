import { createCookieSessionStorage, type FetchEvent } from "solid-start";
import type { Middleware } from "solid-start/entry-server";
import {
  coerce,
  number,
  object,
  safeParseAsync,
  string,
  type Input,
} from "valibot";
import { jsonFetcher } from "./fetcher";
import type { User } from "./types";
import { removeInvalidCharacters } from "./utils";

const createStorage = (env: Env) => {
  return createCookieSessionStorage({
    cookie: {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      name: "session",
      path: "/",
      sameSite: "lax",
      secrets: [env.SESSION_SECRET],
      secure: true,
    },
  });
};

const fullNameKey = "fullName";
const idKey = "id";
const tokenKey = "token";

const sessionSchema = () => {
  return object({
    [fullNameKey]: string(),
    [idKey]: coerce(number(), Number),
    [tokenKey]: string(),
  });
};

export type Session = Input<ReturnType<typeof sessionSchema>>;

const getSessionFromCookie = async ({
  request,
  env,
}: Pick<FetchEvent, "request" | "env">): Promise<Session | null> => {
  const storage = createStorage(env);

  const session = await storage.getSession(request.headers.get("Cookie"));

  const parsed = await safeParseAsync(sessionSchema(), {
    [fullNameKey]: session.get(fullNameKey),
    [idKey]: session.get(idKey),
    [tokenKey]: session.get(tokenKey),
  });

  if (parsed.success) {
    return parsed.output;
  }

  return null;
};

export const sessionMiddleware: Middleware = ({ forward }) => {
  return async (event) => {
    const session = await getSessionFromCookie(event);
    if (event?.locals) {
      event.locals.session = session;
    }
    return forward(event);
  };
};

type GetSessionArgs = Pick<FetchEvent, "locals" | "env" | "request">;

export const getSession = async ({
  locals,
  env,
  request,
}: GetSessionArgs): Promise<Session | null> => {
  if ("session" in locals) {
    return locals.session as Session | null;
  }

  const session = await getSessionFromCookie({ env, request });
  locals.session = session;

  return session;
};

export const getSessionOrThrow = async (
  args: GetSessionArgs
): Promise<Session> => {
  const session = await getSession(args);

  if (!session) {
    throw { code: 401, message: "Unauthorized" };
  }

  return session;
};

type SetSessionCookieArgs = {
  env: Env;
  request: Request;
  token: string;
};

export const setSessionCookie = async ({
  env,
  request,
  token,
}: SetSessionCookieArgs) => {
  const storage = createStorage(env);

  const session = await storage.getSession(request.headers.get("Cookie"));

  const data = await jsonFetcher<{ user: User }>({
    env,
    path: "/users/current.json",
    token,
  });

  session.set(tokenKey, token);
  session.set(idKey, data.user.id);
  session.set(
    fullNameKey,
    removeInvalidCharacters(`${data.user.firstname} ${data.user.lastname}`)
  );

  return storage.commitSession(session);
};

type DestroySessionCookieArgs = {
  env: Env;
  request: Request;
};

export const destroySessionCookie = async ({
  request,
  env,
}: DestroySessionCookieArgs) => {
  const storage = createStorage(env);

  const session = await storage.getSession(request.headers.get("Cookie"));

  return storage.destroySession(session);
};
