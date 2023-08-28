import { createCookieSessionStorage } from "solid-start";
import { coerce, number, object, safeParse, string, type Input } from "valibot";
import { jsonFetcher, type Fetch } from "./fetcher";
import type { User } from "./types";

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

type GetSessionArgs = {
  env: Env;
  request: Request;
};

const getSessionFromCookie = async ({
  env,
  request,
}: GetSessionArgs): Promise<Session | null> => {
  const storage = createStorage(env);

  const session = await storage.getSession(request.headers.get("Cookie"));

  const parsed = safeParse(sessionSchema(), {
    [fullNameKey]: session.get(fullNameKey),
    [idKey]: session.get(idKey),
    [tokenKey]: session.get(tokenKey),
  });

  if (parsed.success) {
    return parsed.output;
  }

  return null;
};

export const getSession = ({
  env,
  request,
}: GetSessionArgs): Promise<Session | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unsafeRequest = request as any;

  if (!unsafeRequest?.sessionPromise) {
    unsafeRequest.sessionPromise = getSessionFromCookie({ env, request });
  }

  return unsafeRequest?.sessionPromise;
};

export const getSessionOrThrow = async ({
  env,
  request,
}: GetSessionArgs): Promise<Session> => {
  const session = await getSession({ env, request });

  if (!session) {
    throw { code: 401, message: "Unauthorized" };
  }

  return session;
};

type SetSessionCookieArgs = {
  env: Env;
  fetch: Fetch;
  request: Request;
  token: string;
};

export const setSessionCookie = async ({
  env,
  fetch,
  request,
  token,
}: SetSessionCookieArgs) => {
  const storage = createStorage(env);

  const session = await storage.getSession(request.headers.get("Cookie"));

  const data = await jsonFetcher<{ user: User }>({
    env,
    fetch,
    path: "/users/current.json",
    token,
  });

  session.set(tokenKey, token);
  session.set(idKey, data.user.id);
  session.set(fullNameKey, `${data.user.firstname} ${data.user.lastname}`);

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
