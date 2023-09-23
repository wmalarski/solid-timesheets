import {
  ServerError,
  createCookieSessionStorage,
  type FetchEvent,
} from "solid-start";
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

type GetSessionArgs = Pick<FetchEvent, "env" | "request">;

export const getSession = ({
  env,
  request,
}: GetSessionArgs): Promise<Session | null> => {
  if (!request || !env) {
    throw new ServerError(`env:${Boolean(env)}; request:${Boolean(request)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unsafeRequest = request as any;

  if (!unsafeRequest?.sessionPromise) {
    unsafeRequest.sessionPromise = getSessionFromCookie({ env, request });
  }

  return unsafeRequest?.sessionPromise;
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
    context: {
      baseUrl: env.RM_BASE_URL,
      session: { fullName: "", id: 0, token },
    },
    path: "/users/current.json",
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
