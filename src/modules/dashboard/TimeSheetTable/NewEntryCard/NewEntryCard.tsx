import type { Component } from "solid-js";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";

type Props = {
  args: CreateTimeEntryArgs;
};

export const NewEntryCard: Component<Props> = (props) => {
  return <pre>{JSON.stringify(props.args, null, 2)}</pre>;
};
