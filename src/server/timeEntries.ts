import server$, { useRequest } from "solid-start/server";
import { z } from "zod";
import { formatRequestDate } from "~/utils/format";
import { jsonFetcher } from "./fetcher";
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
  spentOn: z.coerce.date().optional(),
  userId: z.coerce.number().optional(),
});

export const createTimeEntryServerMutation = server$(
  async (data: z.infer<typeof createTimeEntryArgs>) => {
    const parsed = createTimeEntryArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    return jsonFetcher({
      fetch: server$.fetch,
      init: {
        body: JSON.stringify({
          activity_id: parsed.activityId,
          comments: parsed.comments,
          hours: parsed.hours,
          issue_id: parsed.issueId,
          spent_on: parsed.spentOn && formatRequestDate(parsed.spentOn),
          user_id: parsed.userId,
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

export const updateTimeEntryServerMutation = server$(
  async (data: z.infer<typeof updateTimeEntryArgs>) => {
    const parsed = updateTimeEntryArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    return jsonFetcher({
      fetch: server$.fetch,
      init: {
        body: JSON.stringify({
          activity_id: parsed.activityId,
          comments: parsed.comments,
          hours: parsed.hours,
          issue_id: parsed.issueId,
          spent_on: parsed.spentOn && formatRequestDate(parsed.spentOn),
          user_id: parsed.userId,
        }),
        method: "PUT",
      },
      path: `/time_entries/${parsed.id}.json`,
      token: session.token,
    });
  }
);

const deleteTimeEntryArgs = z.object({
  id: z.number(),
});

export const deleteTimeEntryServerMutation = server$(
  async (data: z.infer<typeof deleteTimeEntryArgs>) => {
    const parsed = deleteTimeEntryArgs.parse(data);

    const session = await getSessionOrThrow(server$.request);

    return jsonFetcher({
      fetch: server$.fetch,
      init: { method: "DELETE" },
      path: `/time_entries/${parsed.id}.json`,
      token: session.token,
    });
  }
);
