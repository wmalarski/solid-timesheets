import server$ from "solid-start/server";
import {
  array,
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
import { getRMContext } from "./context";
import { jsonFetcher } from "./fetcher";
import type { Issue } from "./types";

const getIssuesArgsSchema = () => {
  return object({
    assignedToId: optional(union([number(), literal("me")])),
    issueIds: optional(array(coerce(number(), Number))),
    limit: optional(coerce(number(), Number)),
    offset: optional(coerce(number(), Number)),
    sort: optional(string()),
    statusId: optional(
      union([literal("open"), literal("closed"), literal("*")])
    ),
  });
};

type GetIssuesSchema = Input<ReturnType<typeof getIssuesArgsSchema>>;

type GetIssuesResult = {
  issues: Issue[];
  total_count: number;
  offset: number;
  limit: number;
};

export const getIssuesKey = (args: GetIssuesSchema) => {
  return ["getIssues", args] as const;
};

export const getIssuesServerQuery = server$(
  async ([, args]: ReturnType<typeof getIssuesKey>) => {
    const parsed = await parseAsync(getIssuesArgsSchema(), args);

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    return jsonFetcher<GetIssuesResult>({
      context,
      path: "/issues.json",
      query: {
        assigned_to_id: parsed.assignedToId,
        issue_id: parsed.issueIds?.join(","),
        limit: parsed.limit,
        offset: parsed.offset,
        sort: parsed.sort,
        status_id: parsed.statusId,
      },
    });
  }
);

const getIssueArgsSchema = () => {
  return object({
    id: coerce(number(), Number),
  });
};

type GetIssueSchema = Input<ReturnType<typeof getIssueArgsSchema>>;

type GetIssueResult = {
  issue: Issue;
};

export const getIssueKey = (args: GetIssueSchema) => {
  return ["getIssue", args] as const;
};

export const getIssueServerQuery = server$(
  async ([, args]: ReturnType<typeof getIssueKey>) => {
    const parsed = await parseAsync(getIssueArgsSchema(), args);

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    return jsonFetcher<GetIssueResult>({
      context,
      path: `/issues/${parsed.id}.json`,
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
