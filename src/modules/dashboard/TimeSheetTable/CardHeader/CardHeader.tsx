import type { Component, JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import type { Issue } from "~/server/types";

type Props = {
  isPending: boolean;
  issue: Issue;
  menu: JSX.Element;
};

export const CardHeader: Component<Props> = (props) => {
  return (
    <header class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <Badge class="uppercase" variant="outline">
          {props.issue.id}
        </Badge>
        {props.menu}
      </div>
      <span class="text-xs font-semibold uppercase">
        {props.issue.project.name}
      </span>
      <span class="text-base">{props.issue.subject}</span>
    </header>
  );
};
