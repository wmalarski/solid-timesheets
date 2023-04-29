import { Show, createSignal, type Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { Card, CardBody } from "~/components/Card";
import type { TimeEntry } from "~/server/types";
import { TimeEntryForm, type TimeEntryFormData } from "../TimeEntryForm";

type EditFormProps = {
  entry: TimeEntry;
  onEnd: () => void;
};

const EditForm: Component<EditFormProps> = (props) => {
  const onSubmit = (data: TimeEntryFormData) => {
    //
    props.onEnd();
  };

  return (
    <TimeEntryForm
      initialValues={props.entry}
      onReset={props.onEnd}
      onSubmit={onSubmit}
      error=""
      isLoading={false}
    />
  );
};

type TimeEntryCardProps = {
  entry: TimeEntry;
};

export const TimeEntryCard: Component<TimeEntryCardProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);

  const onEditToggle = () => {
    setIsEditing((current) => !current);
  };

  return (
    <Card variant="bordered" size="compact">
      <CardBody>
        <Badge variant="outline">{props.entry.id}</Badge>
        <span>{props.entry.comments}</span>
        <span>{props.entry.hours}</span>
        <div class="flex justify-end">
          <Show
            when={isEditing()}
            fallback={
              <Button
                onClick={onEditToggle}
                variant="outline"
                size="xs"
                color="accent"
              >
                Edit
              </Button>
            }
          >
            <Button
              onClick={onEditToggle}
              variant="outline"
              size="xs"
              color="error"
            >
              Cancel
            </Button>
            <Button variant="outline" size="xs" color="success">
              Save
            </Button>
          </Show>
        </div>
      </CardBody>
    </Card>
  );
};
