import type { Component, JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import { issueHref } from "~/server/issues";
import { useDashboardConfig } from "../../DashboardConfig";

type Props = {
  issueId: number;
  menu: JSX.Element;
};

export const CardHeader: Component<Props> = (props) => {
  const config = useDashboardConfig();

  return (
    <header class="flex items-center gap-2">
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
    </header>
  );
};
