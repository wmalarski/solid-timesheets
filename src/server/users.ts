import { jsonFetcher, type Fetch } from "./fetcher";
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
