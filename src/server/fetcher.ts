import type { ServerFunctionEvent } from "solid-start";
import { buildSearchParams } from "~/utils/searchParams";
import { serverEnv } from "./env";

export type Fetch = ServerFunctionEvent["fetch"];

export type FetcherError = {
  status: number;
  message: string;
};

export type FetcherArgs = {
  fetch: Fetch;
  init?: RequestInit;
  path: string;
  query?: Record<string, unknown>;
  token?: string;
};

export const fetcher = async ({
  fetch,
  init,
  path,
  query,
  token,
}: FetcherArgs) => {
  const search = buildSearchParams(query);
  const url = `${serverEnv.RM_BASE_URL}${path}?${search}`;

  const headers = token
    ? { ...init?.headers, "X-Redmine-API-Key": token }
    : init?.headers || {};

  const response = await fetch(url, { ...init, headers });

  if (response.status >= 400) {
    throw { message: response.statusText, status: response.status };
  }

  return response;
};

export const jsonFetcher = async <T>(args: FetcherArgs): Promise<T> => {
  const response = await fetcher({
    ...args,
    init: {
      ...args.init,
      headers: {
        ...args.init?.headers,
        "Content-Type": "application/json",
      },
    },
  });

  return response.json();
};
