import { For, type Component } from "solid-js";
import type { Issue } from "~/server/types";

type IssueSelectProps = {
  issues: Issue[];
};

export const IssueSelect: Component<IssueSelectProps> = (props) => {
  return (
    <div>
      <For each={props.issues}>
        {(issue) => <pre>{JSON.stringify(issue, null, 2)}</pre>}
      </For>
    </div>
  );
};
