import { buildSearchParams } from "~/utils/searchParams";
import type { RMContext } from "./context";

export type FetcherError = {
  status: number;
  message: string;
};

type FetcherArgs = {
  context: RMContext;
  init?: RequestInit;
  path: string;
  query?: Record<string, unknown>;
};

export const fetcher = async ({ context, init, path, query }: FetcherArgs) => {
  const search = buildSearchParams(query);
  const url = `${context.baseUrl}${path}?${search}`;

  const headers = {
    ...init?.headers,
    "X-Redmine-API-Key": context.session.token,
  };
  const response = await fetch(url, { ...init, headers });

  if (response.status >= 400) {
    throw { message: response.statusText, status: response.status };
  }

  return response;
};

export const jsonRequestFetcher = async (args: FetcherArgs) => {
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

  return response;
};

export const jsonFetcher = async <T>(args: FetcherArgs): Promise<T> => {
  const response = await jsonRequestFetcher(args);

  return response.json();
};
