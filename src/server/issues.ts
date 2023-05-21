import server$, { useRequest } from "solid-start/server";
import { z } from "zod";
import { jsonFetcher } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { Issue } from "./types";

const getIssuesArgs = z.object({
  assignedToId: z.union([z.coerce.number(), z.literal("me")]).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  sort: z.string().optional(),
  statusId: z
    .union([z.literal("open"), z.literal("closed"), z.literal("*")])
    .optional(),
});

export type GetIssuesResult = {
  issues: Issue[];
  total_count: number;
  offset: number;
  limit: number;
};

export const getIssuesKey = (args: z.infer<typeof getIssuesArgs>) => {
  return ["getIssues", args] as const;
};

export const getAllIssuesKey = () => {
  return ["getIssues"] as const;
};

export const getIssuesServerQuery = server$(
  async ([, args]: ReturnType<typeof getIssuesKey>) => {
    const parsed = getIssuesArgs.parse(args);

    const event = useRequest();
    const fetch = server$.fetch || event.fetch;
    const request = server$.request || event.request;

    const session = await getSessionOrThrow(request);

    return jsonFetcher<GetIssuesResult>({
      fetch,
      path: "/issues.json",
      query: {
        assigned_to_id: parsed.assignedToId,
        limit: parsed.limit,
        offset: parsed.offset,
        sort: parsed.sort,
        status_id: parsed.statusId,
      },
      token: session.token,
    });
  }
);

type IssueHrefArgs = {
  issueId: number;
  rmBaseUrl: string;
};

export const issueHref = (args: IssueHrefArgs) => {
  return `${args.rmBaseUrl}/issues/${args.issueId}`;
};
