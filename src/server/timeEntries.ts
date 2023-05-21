import server$, { useRequest } from "solid-start/server";
import { z } from "zod";
import { formatRequestDate } from "~/utils/format";
import { buildSearchParams } from "~/utils/searchParams";
import { fetcher, jsonFetcher } from "./fetcher";
import { getSessionOrThrow } from "./session";
import type { TimeEntry } from "./types";

export const getTimeEntriesArgs = z.object({
  from: z.coerce.date().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  projectId: z.coerce.number().optional(),
  to: z.coerce.date().optional(),
});

export type GetTimeEntriesArgs = z.infer<typeof getTimeEntriesArgs>;

export type GetTimeEntriesResult = {
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
    const parsed = getTimeEntriesArgs.parse(args);

    const event = useRequest();
    const fetch = server$.fetch || event.fetch;
    const request = server$.request || event.request;

    const session = await getSessionOrThrow(request);

    return jsonFetcher<GetTimeEntriesResult>({
      fetch,
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

export const createTimeEntryArgs = z.object({
  activityId: z.coerce.number().optional(),
  comments: z.string().max(255).optional().default(""),
  hours: z.coerce.number(),
  issueId: z.coerce.number(),
  spentOn: z.coerce.date(),
});

export type CreateTimeEntryArgs = z.infer<typeof createTimeEntryArgs>;

export const createTimeEntryServerMutation = server$(
  async (data: CreateTimeEntryArgs) => {
    const parsed = createTimeEntryArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    return jsonFetcher<TimeEntry>({
      fetch: server$.fetch,
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

export const updateTimeEntryArgs = z.intersection(
  createTimeEntryArgs.partial(),
  z.object({ id: z.number() })
);

export type UpdateTimeEntryArgs = z.infer<typeof updateTimeEntryArgs>;

export const updateTimeEntryServerMutation = server$(
  async (data: UpdateTimeEntryArgs) => {
    const parsed = updateTimeEntryArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    await fetcher({
      fetch: server$.fetch,
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

export const upsertTimeEntriesArgs = z.object({
  create: z.array(createTimeEntryArgs),
  update: z.array(updateTimeEntryArgs),
});

export type UpsertTimeEntriesArgs = z.infer<typeof upsertTimeEntriesArgs>;

export const upsertTimeEntriesServerMutation = server$(
  async (data: UpsertTimeEntriesArgs) => {
    const parsed = upsertTimeEntriesArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    await Promise.all([
      ...parsed.create.map((entry) =>
        jsonFetcher<TimeEntry>({
          fetch: server$.fetch,
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
        jsonFetcher<TimeEntry>({
          fetch: server$.fetch,
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

const deleteTimeEntryArgs = z.object({
  id: z.number(),
});

export type DeleteTimeEntryArgs = z.infer<typeof deleteTimeEntryArgs>;

export const deleteTimeEntryServerMutation = server$(
  async (data: DeleteTimeEntryArgs) => {
    const parsed = deleteTimeEntryArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    await fetcher({
      fetch: server$.fetch,
      init: { method: "DELETE" },
      path: `/time_entries/${parsed.id}.json`,
      token: session.token,
    });
  }
);

const deleteTimeEntriesArgs = z.object({
  ids: z.array(z.number()),
});

export type DeleteTimeEntriesArgs = z.infer<typeof deleteTimeEntriesArgs>;

export const deleteTimeEntriesServerMutation = server$(
  async (data: DeleteTimeEntriesArgs) => {
    const parsed = deleteTimeEntriesArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    await Promise.all(
      parsed.ids.map((id) => {
        return fetcher({
          fetch: server$.fetch,
          init: { method: "DELETE" },
          path: `/time_entries/${id}.json`,
          token: session.token,
        });
      })
    );
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
