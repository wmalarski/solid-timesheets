import server$ from "solid-start/server";
import {
  array,
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
import { coercedDate, coercedNumber } from "~/utils/validation";
import { getRMContext, type RMContext } from "./context";
import { fetcher, jsonFetcher, jsonRequestFetcher } from "./fetcher";
import type { TimeEntry } from "./types";

const getTimeEntriesArgsSchema = () => {
  return object({
    from: optional(coercedDate()),
    issueId: optional(coercedNumber()),
    sort: optional(string()),
    to: optional(coercedDate()),
  });
};

type GetTimeEntriesSchema = Input<ReturnType<typeof getTimeEntriesArgsSchema>>;

type GetTimeEntriesArgs = GetTimeEntriesSchema & { context: RMContext };

type GetTimeEntriesResult = {
  time_entries: TimeEntry[];
  total_count: number;
  offset: number;
  limit: number;
};

const getTimeEntries = async (args: GetTimeEntriesArgs) => {
  const base = {
    from: args.from && formatRequestDate(args.from),
    issue_id: args.issueId,
    limit: 100,
    sort: args.sort,
    to: args.to && formatRequestDate(args.to),
    user_id: args.context.session.id,
  };

  const timeEntries: TimeEntry[] = [];
  let totalCount = 1;

  for (; timeEntries.length < totalCount; ) {
    // eslint-disable-next-line no-await-in-loop
    const result = await jsonFetcher<GetTimeEntriesResult>({
      context: args.context,
      path: "/time_entries.json",
      query: { ...base, offset: timeEntries.length },
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

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    return getTimeEntries({ context, ...parsed });
  }
);

const getTimeEntryArgsSchema = () => {
  return object({
    id: coercedNumber(),
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

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    return jsonFetcher<GetTimeEntryResult>({
      context,
      path: `/time_entries/${parsed.id}.json`,
    });
  }
);

const createTimeEntryArgsSchema = () => {
  return object({
    activityId: optional(coercedNumber()),
    comments: optional(string([maxLength(255)]), ""),
    hours: coercedNumber(),
    issueId: coercedNumber(),
    spentOn: coercedDate(),
  });
};

export type CreateTimeEntryArgs = Input<
  ReturnType<typeof createTimeEntryArgsSchema>
>;

export const createTimeEntryServerMutation = server$(
  async (args: CreateTimeEntryArgs) => {
    const parsed = await parseAsync(createTimeEntryArgsSchema(), args);

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    return jsonFetcher<TimeEntry>({
      context,
      init: {
        body: JSON.stringify({
          time_entry: {
            activity_id: parsed.activityId,
            comments: parsed.comments,
            hours: parsed.hours,
            issue_id: parsed.issueId,
            spent_on: parsed.spentOn && formatRequestDate(parsed.spentOn),
            user_id: context.session.id,
          },
        }),
        method: "POST",
      },
      path: "/time_entries.json",
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

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    await jsonRequestFetcher({
      context,
      init: {
        body: JSON.stringify({
          time_entry: {
            activity_id: parsed.activityId,
            comments: parsed.comments,
            hours: parsed.hours,
            spent_on: parsed.spentOn && formatRequestDate(parsed.spentOn),
            user_id: context.session.id,
          },
        }),
        method: "PUT",
      },
      path: `/time_entries/${parsed.id}.json`,
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

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    await Promise.all([
      ...parsed.create.map((entry) =>
        jsonRequestFetcher({
          context,
          init: {
            body: JSON.stringify({
              time_entry: {
                activity_id: entry.activityId,
                comments: entry.comments,
                hours: entry.hours,
                issue_id: entry.issueId,
                spent_on: entry.spentOn && formatRequestDate(entry.spentOn),
                user_id: context.session.id,
              },
            }),
            method: "POST",
          },
          path: "/time_entries.json",
        })
      ),
      ...parsed.update.map((entry) =>
        jsonRequestFetcher({
          context,
          init: {
            body: JSON.stringify({
              time_entry: {
                activity_id: entry.activityId,
                comments: entry.comments,
                hours: entry.hours,
                issue_id: entry.issueId,
                spent_on: entry.spentOn && formatRequestDate(entry.spentOn),
                user_id: context.session.id,
              },
            }),
            method: "PUT",
          },
          path: `/time_entries/${entry.id}.json`,
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

    const context = await getRMContext({
      env: server$.env,
      request: server$.request,
    });

    await fetcher({
      context,
      init: { method: "DELETE" },
      path: `/time_entries/${parsed.id}.json`,
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
