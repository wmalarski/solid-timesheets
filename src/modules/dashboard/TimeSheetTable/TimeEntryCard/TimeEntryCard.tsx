import { type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Card, CardBody } from "~/components/Card";
import type { TimeEntry } from "~/server/types";

type TimeEntryCardProps = {
  entry: TimeEntry;
};

export const TimeEntryCard: Component<TimeEntryCardProps> = (props) => {
  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <Badge variant="outline">{props.entry.id}</Badge>
        <span>{props.entry.comments}</span>
        <span>{props.entry.hours}</span>
      </CardBody>
    </Card>
  );
};
