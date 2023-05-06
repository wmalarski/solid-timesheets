import { useI18n } from "@solid-primitives/i18n";
import type { Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { NewEntryForm } from "../NewEntryForm";
import {
  createdTimeEntriesKey,
  useTimeSheetContext,
} from "../TimeSheetTable.utils";

type Props = {
  args: CreateTimeEntryArgs;
  index: number;
};

export const NewEntryCard: Component<Props> = (props) => {
  const [t] = useI18n();

  const { setCreatedTimeEntries } = useTimeSheetContext();

  const key = () => {
    return createdTimeEntriesKey({
      day: props.args.spentOn,
      issueId: props.args.issueId,
    });
  };

  const onDeleteClick = () => {
    const index = props.index;
    setCreatedTimeEntries("map", key(), (current) => {
      const copy = [...current];
      copy.splice(index, 1);
      return copy;
    });
  };

  const onCommentsChange = (comments: string) => {
    setCreatedTimeEntries("map", key(), props.index, "comments", comments);
  };

  const onHoursChange = (hours: number) => {
    setCreatedTimeEntries("map", key(), props.index, "hours", hours);
  };

  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <div>
          <Badge class="uppercase" variant="outline">
            {t("dashboard.timeEntry.pending")}
          </Badge>
          <Button
            variant="outline"
            size="xs"
            onClick={onDeleteClick}
            color="error"
          >
            {t("dashboard.timeEntry.delete")}
          </Button>
        </div>
        <NewEntryForm
          onCommentChange={onCommentsChange}
          onHoursChange={onHoursChange}
          value={props.args}
        />
      </CardBody>
    </Card>
  );
};
