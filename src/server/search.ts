import server$ from "solid-start/server";
import { object, optional, parseAsync, string, type Input } from "valibot";
import { coercedNumber } from "~/utils/validation";
import { getRMContext } from "./context";
import { jsonFetcher } from "./fetcher";
import { getIssues } from "./issues";
import type { SearchResult } from "./types";

const getSearchArgsSchema = () => {
  return object({
    limit: optional(coercedNumber()),
    offset: optional(coercedNumber()),
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

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    if (parsed.query.length === 0) {
      const result = await getIssues({
        assignedToId: "me",
        context,
        limit: parsed.limit,
      });

      return result.issues.map((issue) => ({
        id: issue.id,
        subject: issue.subject,
        title: issue.project.name,
      }));
    }

    const result = await jsonFetcher<GetSearchResult>({
      context,
      path: "/search.json",
      query: {
        issues: 1,
        limit: parsed.limit,
        offset: parsed.offset,
        q: parsed.query,
      },
    });

    return result.results.map((result) => {
      const [title, subject] = result.title.split(": ");
      return { id: result.id, subject, title };
    });
  }
);

export type SearchOption = Awaited<ReturnType<typeof getSearchServerQuery>>[0];
