import server$ from "solid-start/server";
import {
  coerce,
  number,
  object,
  optional,
  parseAsync,
  string,
  type Input,
} from "valibot";
import { jsonFetcher } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { SearchResult } from "./types";

const getSearchArgsSchema = () => {
  return object({
    limit: optional(coerce(number(), Number)),
    offset: optional(coerce(number(), Number)),
    query: string(),
  });
};

type GetSearchResult = {
  results: SearchResult[];
  total_count: number;
  offset: number;
  limit: number;
};

export const getSearchKey = (
  args: Input<ReturnType<typeof getSearchArgsSchema>>
) => {
  return ["getSearch", args] as const;
};

export const getSearchServerQuery = server$(
  async ([, args]: ReturnType<typeof getSearchKey>) => {
    const parsed = await parseAsync(getSearchArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    return jsonFetcher<GetSearchResult>({
      env,
      path: "/search.json",
      query: {
        limit: parsed.limit,
        offset: parsed.offset,
        q: parsed.query,
      },
      token: session.token,
    });
  }
);
