import { useI18n } from "@solid-primitives/i18n";
import type { Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Card, CardBody } from "~/components/Card";
import type { CreateTimeEntryArgs } from "~/server/timeEntries";
import { TimeEntryForm, type TimeEntryFormData } from "../TimeEntryForm";
import { useTimeSheetContext } from "../TimeSheetTable.utils";

type Props = {
  args: CreateTimeEntryArgs;
  index: number;
};

export const NewEntryCard: Component<Props> = (props) => {
  const [t] = useI18n();

  const { deleteTimeEntry, updateTimeEntry } = useTimeSheetContext();

  const onDeleteClick = () => {
    deleteTimeEntry(props.index, props.args);
  };

  const onSubmit = (data: TimeEntryFormData) => {
    updateTimeEntry(props.index, { ...props.args, ...data });
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
