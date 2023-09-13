import server$ from "solid-start/server";
import {
  array,
  coerce,
  date,
  maxLength,
  merge,
  number,
  object,
  optional,
  parseAsync,
  partial,
  string,
  type Input,
} from "valibot";
import { formatRequestDate } from "~/utils/format";
import { buildSearchParams } from "~/utils/searchParams";
import { fetcher, jsonFetcher, jsonRequestFetcher } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { TimeEntry } from "./types";

const getTimeEntriesArgsSchema = () => {
  return object({
    from: optional(coerce(date(), (value) => new Date(String(value)))),
    limit: optional(coerce(number(), Number)),
    offset: optional(coerce(number(), Number)),
    projectId: optional(coerce(number(), Number)),
    to: optional(coerce(date(), (value) => new Date(String(value)))),
  });
};

type GetTimeEntriesArgs = Input<ReturnType<typeof getTimeEntriesArgsSchema>>;

type GetTimeEntriesResult = {
  time_entries: TimeEntry[];
  total_count: number;
  offset: number;
  limit: number;
};

export const getTimeEntriesKey = (args: GetTimeEntriesArgs) => {
  return ["getTimeEntries", args] as const;
};

export const getAllTimeEntriesKey = () => {
  return ["getTimeEntries"] as const;
};

export const getTimeEntriesServerQuery = server$(
  async ([, args]: ReturnType<typeof getTimeEntriesKey>) => {
    const parsed = await parseAsync(getTimeEntriesArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    return jsonFetcher<GetTimeEntriesResult>({
      env,
      path: "/time_entries.json",
      query: {
        from: parsed.from && formatRequestDate(parsed.from),
        limit: parsed.limit,
        offset: parsed.offset,
        project_id: parsed.projectId,
        to: parsed.to && formatRequestDate(parsed.to),
        user_id: session.id,
      },
      token: session.token,
    });
  }
);

const createTimeEntryArgsSchema = () => {
  return object({
    activityId: optional(coerce(number(), Number)),
    comments: optional(string([maxLength(255)]), ""),
    hours: coerce(number(), Number),
    issueId: coerce(number(), Number),
    spentOn: coerce(date(), (value) => new Date(String(value))),
  });
};

export type CreateTimeEntryArgs = Input<
  ReturnType<typeof createTimeEntryArgsSchema>
>;

export const createTimeEntryServerMutation = server$(
  async (args: CreateTimeEntryArgs) => {
    const parsed = await parseAsync(createTimeEntryArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    return jsonFetcher<TimeEntry>({
      env,
      init: {
        body: JSON.stringify({
          time_entry: {
            activity_id: parsed.activityId,
            comments: parsed.comments,
            hours: parsed.hours,
            issue_id: parsed.issueId,
            spent_on: parsed.spentOn && formatRequestDate(parsed.spentOn),
            user_id: session.id,
          },
        }),
        method: "POST",
      },
      path: "/time_entries.json",
      token: session.token,
    });
  }
);

const updateTimeEntryArgsSchema = () => {
  return merge([
    partial(createTimeEntryArgsSchema()),
    object({ id: number() }),
  ]);
};

export type UpdateTimeEntryArgs = Input<
  ReturnType<typeof updateTimeEntryArgsSchema>
>;

export const updateTimeEntryServerMutation = server$(
  async (args: UpdateTimeEntryArgs) => {
    const parsed = await parseAsync(updateTimeEntryArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    await jsonRequestFetcher({
      env,
      init: {
        body: JSON.stringify({
          time_entry: {
            activity_id: parsed.activityId,
            comments: parsed.comments,
            hours: parsed.hours,
            issue_id: parsed.issueId,
            spent_on: parsed.spentOn && formatRequestDate(parsed.spentOn),
            user_id: session.id,
          },
        }),
        method: "PUT",
      },
      path: `/time_entries/${parsed.id}.json`,
      token: session.token,
    });
  }
);

const upsertTimeEntriesArgsSchema = () => {
  return object({
    create: array(createTimeEntryArgsSchema()),
    update: array(updateTimeEntryArgsSchema()),
  });
};

type UpsertTimeEntriesArgs = Input<
  ReturnType<typeof upsertTimeEntriesArgsSchema>
>;

export const upsertTimeEntriesServerMutation = server$(
  async (args: UpsertTimeEntriesArgs) => {
    const parsed = await parseAsync(upsertTimeEntriesArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    await Promise.all([
      ...parsed.create.map((entry) =>
        jsonRequestFetcher({
          env,
          init: {
            body: JSON.stringify({
              time_entry: {
                activity_id: entry.activityId,
                comments: entry.comments,
                hours: entry.hours,
                issue_id: entry.issueId,
                spent_on: entry.spentOn && formatRequestDate(entry.spentOn),
                user_id: session.id,
              },
            }),
            method: "POST",
          },
          path: "/time_entries.json",
          token: session.token,
        })
      ),
      ...parsed.update.map((entry) =>
        jsonRequestFetcher({
          env,
          init: {
            body: JSON.stringify({
              time_entry: {
                activity_id: entry.activityId,
                comments: entry.comments,
                hours: entry.hours,
                issue_id: entry.issueId,
                spent_on: entry.spentOn && formatRequestDate(entry.spentOn),
                user_id: session.id,
              },
            }),
            method: "PUT",
          },
          path: `/time_entries/${entry.id}.json`,
          token: session.token,
        })
      ),
    ]);
  }
);

const deleteTimeEntryArgsSchema = () => {
  return object({
    id: number(),
  });
};

type DeleteTimeEntryArgs = Input<ReturnType<typeof deleteTimeEntryArgsSchema>>;

export const deleteTimeEntryServerMutation = server$(
  async (args: DeleteTimeEntryArgs) => {
    const parsed = await parseAsync(deleteTimeEntryArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    await fetcher({
      env,
      init: { method: "DELETE" },
      path: `/time_entries/${parsed.id}.json`,
      token: session.token,
    });
  }
);

type WorkTimeHrefArgs = {
  date: Date;
  rmBaseUrl: string;
  userId: number;
};

export const workTimeHref = (args: WorkTimeHrefArgs) => {
  const params = buildSearchParams({
    month: args.date.getMonth() + 1,
    user: args.userId,
    year: args.date.getFullYear(),
  });
  return `${args.rmBaseUrl}/work_time/member_monthly_data?${params}`;
};
