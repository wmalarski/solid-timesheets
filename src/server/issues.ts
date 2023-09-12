import server$ from "solid-start/server";
import {
  coerce,
  literal,
  number,
  object,
  optional,
  parseAsync,
  string,
  union,
  type Input,
} from "valibot";
import { jsonFetcher } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { Issue } from "./types";

const getIssuesArgsSchema = () => {
  return object({
    assignedToId: optional(union([number(), literal("me")])),
    limit: optional(coerce(number(), Number)),
    offset: optional(coerce(number(), Number)),
    sort: optional(string()),
    statusId: optional(
      union([literal("open"), literal("closed"), literal("*")])
    ),
  });
};

type GetIssuesResult = {
  issues: Issue[];
  total_count: number;
  offset: number;
  limit: number;
};

export const getIssuesKey = (
  args: Input<ReturnType<typeof getIssuesArgsSchema>>
) => {
  return ["getIssues", args] as const;
};

export const getIssuesServerQuery = server$(
  async ([, args]: ReturnType<typeof getIssuesKey>) => {
    const parsed = await parseAsync(getIssuesArgsSchema(), args);

    const session = await getSessionOrThrow({
      env: server$.env,
      locals: server$.locals,
      request: server$.request,
    });

    return jsonFetcher<GetIssuesResult>({
      env: server$.env,
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
