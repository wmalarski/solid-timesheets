import server$, { useRequest } from "solid-start/server";
import { jsonFetcher, type Fetch } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { User } from "./types";

export type GetCurrentUserArgs = {
  fetch: Fetch;
  token: string;
};

export type GetCurrentUserResult = {
  user: User;
};

export const getCurrentUser = (args: GetCurrentUserArgs) => {
  return jsonFetcher<GetCurrentUserResult>({
    fetch: args.fetch,
    path: "/users/current.json",
    token: args.token,
  });
};

export const getCurrentUserKey = () => {
  return ["getCurrentUser"] as const;
};

export const getCurrentUserServerQuery = server$(async () => {
  const event = useRequest();
  const fetch = server$.fetch || event.fetch;
  const request = server$.request || event.request;

  const session = await getSessionOrThrow(request);

  return getCurrentUser({ fetch, token: session.token });
});
