import type { Component } from "solid-js";
import { Button } from "~/components/Button";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";

type Props = {
  args: CreateTimeEntryArgs;
  index: number;
};

export const NewEntryCard: Component<Props> = (props) => {
  return (
    <>
      <Button onClick={}>Delete</Button>
      <pre>{JSON.stringify(props.args, null, 2)}</pre>
    </>
  );
};
