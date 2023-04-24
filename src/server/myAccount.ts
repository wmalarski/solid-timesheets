import { jsonFetcher, type Fetch } from "./fetcher";

export type GetMyAccountArgs = {
  fetch: Fetch;
  token: string;
};

export const getMyAccount = (args: GetMyAccountArgs) => {
  return jsonFetcher({
    fetch: args.fetch,
    path: "/my/account.json",
    token: args.token,
  });
};
