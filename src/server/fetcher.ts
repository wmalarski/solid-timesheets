import type { ServerFunctionEvent } from "solid-start";
import { serverEnv } from "./env";

export const buildSearchParams = (
  query?: Record<string, unknown>
): URLSearchParams => {
  const entries = Object.entries(query || {});
  const pairs = entries.flatMap(([key, value]) =>
    value !== undefined ? [[key, `${value}`]] : []
  );
  return new URLSearchParams(pairs);
};

type FetcherArgs = {
  fetch: ServerFunctionEvent["fetch"];
  init?: RequestInit;
  path: string;
  query?: Record<string, unknown>;
  token?: string;
};

export const fetcher = ({ fetch, init, path, query, token }: FetcherArgs) => {
  const search = buildSearchParams(query);
  const url = `${serverEnv.RM_BASE_URL}${path}?${search}`;

  if (!token) {
    return fetch(url, init || {});
  }

  return fetch(url, {
    ...init,
    headers: { ...init?.headers, "X-Redmine-API-Key": token },
  });
};

export const jsonFetcher = async <T>(args: FetcherArgs): Promise<T> => {
  const response = await fetcher(args);

  return response.json();
};
