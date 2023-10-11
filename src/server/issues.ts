import server$ from "solid-start/server";
import {
  array,
  literal,
  number,
  object,
  optional,
  parseAsync,
  string,
  union,
  type Input,
} from "valibot";
import { coercedNumber } from "~/utils/validation";
import { getRMContext, type RMContext } from "./context";
import { jsonFetcher } from "./fetcher";
import type { Issue } from "./types";

const getIssuesArgsSchema = () => {
  return object({
    assignedToId: optional(union([number(), literal("me")])),
    issueIds: optional(array(coercedNumber())),
    limit: optional(coercedNumber()),
    offset: optional(coercedNumber()),
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

type GetIssuesArgs = GetIssuesSchema & { context: RMContext };

export const getIssues = (args: GetIssuesArgs) => {
  return jsonFetcher<GetIssuesResult>({
    context: args.context,
    path: "/issues.json",
    query: {
      assigned_to_id: args.assignedToId,
      issue_id: args.issueIds?.join(","),
      limit: args.limit,
      offset: args.offset,
      sort: args.sort,
      status_id: args.statusId,
    },
  });
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

    return getIssues({ context, ...parsed });
  }
);

const getIssueArgsSchema = () => {
  return object({
    id: coercedNumber(),
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
