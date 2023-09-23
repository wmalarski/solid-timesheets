import { createQuery } from "@tanstack/solid-query";
import type { Component, JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import { getIssueKey, getIssueServerQuery, issueHref } from "~/server/issues";
import { useDashboardConfig } from "../../DashboardConfig";

type Props = {
  isPending: boolean;
  issueId: number;
  menu: JSX.Element;
};

export const CardHeader: Component<Props> = (props) => {
  const config = useDashboardConfig();

  const issueQuery = createQuery(() => ({
    queryFn: (context) => getIssueServerQuery(context.queryKey),
    queryKey: getIssueKey({ id: props.issueId }),
  }));

  return (
    <header class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <a
          class="grow"
          href={issueHref({
            issueId: props.issueId,
            rmBaseUrl: config().rmBaseUrl,
          })}
        >
          <Badge class="hover:underline" variant="outline">
            {props.issueId}
          </Badge>
        </a>
        {props.menu}
      </div>
      <span class="text-xs font-semibold uppercase">
        {issueQuery.data?.issue.project.name}
      </span>
      <span class="text-base">{issueQuery.data?.issue.subject}</span>
    </header>
  );
};
