import { useI18n } from "@solid-primitives/i18n";
import type { Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Card, CardBody } from "~/components/Card";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { TimeEntryForm, type TimeEntryFormData } from "../TimeEntryForm";
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

  const onSubmit = (data: TimeEntryFormData) => {
    setCreatedTimeEntries("map", key(), props.index, (current) => ({
      ...current,
      ...data,
    }));
  };

  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <Badge class="uppercase" variant="outline">
          {t("dashboard.timeEntry.pending")}
        </Badge>
        <TimeEntryForm
          onSubmit={onSubmit}
          onReset={onDeleteClick}
          initialValues={props.args}
        />
      </CardBody>
    </Card>
  );
};
