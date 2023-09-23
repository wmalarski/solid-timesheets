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
import { getRMContext, type RMContext } from "./context";
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

type GetIssuesArgs = GetIssuesSchema & { context: RMContext };

type GetIssuesResult = {
  issues: Issue[];
  total_count: number;
  offset: number;
  limit: number;
};

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

type IssueHrefArgs = {
  issueId: number;
  rmBaseUrl: string;
};

export const issueHref = (args: IssueHrefArgs) => {
  return `${args.rmBaseUrl}/issues/${args.issueId}`;
};
