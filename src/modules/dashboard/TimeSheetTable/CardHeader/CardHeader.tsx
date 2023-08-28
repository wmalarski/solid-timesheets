import type { Component, JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import { issueHref } from "~/server/issues";
import type { IssueEssentials } from "~/server/types";
import { useDashboardConfig } from "../../DashboardConfig";

type Props = {
  isPending: boolean;
  issue: IssueEssentials;
  menu: JSX.Element;
};

export const CardHeader: Component<Props> = (props) => {
  const config = useDashboardConfig();

  return (
    <header class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <a
          class="grow"
          href={issueHref({
            issueId: props.issue.id,
            rmBaseUrl: config().rmBaseUrl,
          })}
        >
          <Badge class="hover:underline" variant="outline">
            {props.issue.id}
          </Badge>
        </a>
        {props.menu}
      </div>
      <span class="text-xs font-semibold uppercase">
        {props.issue.project.name}
      </span>
      <span class="text-base">{props.issue.subject}</span>
    </header>
  );
};
