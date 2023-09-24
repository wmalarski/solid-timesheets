import { createQuery } from "@tanstack/solid-query";
import { type Component } from "solid-js";
import { twCx } from "~/components/utils/twCva";
import { getIssueKey, getIssueServerQuery } from "~/server/issues";

type IssueDetailsProps = {
  issueId: number;
  class?: string;
};

export const IssueDetails: Component<IssueDetailsProps> = (props) => {
  const issueQuery = createQuery(() => ({
    queryFn: (context) => getIssueServerQuery(context.queryKey),
    queryKey: getIssueKey({ id: props.issueId }),
  }));

  return (
    <div class={twCx("flex flex-col items-start gap-2", props.class)}>
      <span class="text-xs font-semibold uppercase">
        {issueQuery.data?.issue.project.name}
      </span>
      <span class="text-base">{issueQuery.data?.issue.subject}</span>
    </div>
  );
};
