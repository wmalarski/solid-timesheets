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
import { getIssues } from "./issues";
import { getSessionOrThrow, type Session } from "./session";
import type { TimeEntry } from "./types";

const getTimeEntriesArgsSchema = () => {
  return object({
    from: optional(coerce(date(), (value) => new Date(String(value)))),
    to: optional(coerce(date(), (value) => new Date(String(value)))),
  });
};

type GetTimeEntriesSchema = Input<ReturnType<typeof getTimeEntriesArgsSchema>>;

type GetTimeEntriesArgs = GetTimeEntriesSchema & { env: Env; session: Session };

type GetTimeEntriesResult = {
  time_entries: TimeEntry[];
  total_count: number;
  offset: number;
  limit: number;
};

const getTimeEntries = async (args: GetTimeEntriesArgs) => {
  const base = {
    from: args.from && formatRequestDate(args.from),
    limit: 100,
    to: args.to && formatRequestDate(args.to),
    user_id: args.session.id,
  };

  const timeEntries: TimeEntry[] = [];
  let totalCount = 1;

  for (; timeEntries.length < totalCount; ) {
    // eslint-disable-next-line no-await-in-loop
    const result = await jsonFetcher<GetTimeEntriesResult>({
      env: args.env,
      path: "/time_entries.json",
      query: { ...base, offset: timeEntries.length },
      token: args.session.token,
    });

    timeEntries.push(...result.time_entries);
    totalCount = result.total_count;
  }

  return timeEntries;
};

export const getTimeEntriesKey = (args: GetTimeEntriesSchema) => {
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

    const timeEntries = await getTimeEntries({ env, ...parsed, session });

    const issuesIds = timeEntries.map((timeEntry) => timeEntry.issue.id);
    const uniqueIds = [...new Set(issuesIds)];

    const result = await getIssues({
      env,
      issueIds: uniqueIds,
      session,
    });

    return { issues: result.issues, timeEntries };
  }
);

const getTimeEntryArgsSchema = () => {
  return object({
    id: coerce(number(), Number),
  });
};

type GetTimeEntrySchema = Input<ReturnType<typeof getTimeEntryArgsSchema>>;

type GetTimeEntryResult = {
  time_entry: TimeEntry;
};

export const getTimeEntryKey = (args: GetTimeEntrySchema) => {
  return ["getTimeEntry", args] as const;
};

export const getTimeEntryServerQuery = server$(
  async ([, args]: ReturnType<typeof getTimeEntryKey>) => {
    const parsed = await parseAsync(getTimeEntryArgsSchema(), args);

    const env = server$.env;
    const request = server$.request;

    const session = await getSessionOrThrow({ env, request });

    return jsonFetcher<GetTimeEntryResult>({
      env,
      path: `/time_entries/${parsed.id}.json`,
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
