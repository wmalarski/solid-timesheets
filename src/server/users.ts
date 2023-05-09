import server$, { useRequest } from "solid-start/server";
import { jsonFetcher } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { User } from "./types";

export type GetCurrentUserResult = {
  user: User;
};

export const getCurrentUserKey = () => {
  return ["getCurrentUser"] as const;
};

export const getCurrentUserServerQuery = server$(async () => {
  const event = useRequest();
  const fetch = server$.fetch || event.fetch;
  const request = server$.request || event.request;

  const session = await getSessionOrThrow(request);

  return jsonFetcher<GetCurrentUserResult>({
    fetch,
    path: "/users/current.json",
    token: session.token,
  });
});
