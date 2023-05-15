import type { Component } from "solid-js";
import { Badge } from "~/components/Badge";
import { Checkbox, type CheckboxProps } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
import type { Issue, Project } from "~/server/types";

type Props = {
  isChecked: boolean;
  isPending: boolean;
  issue: Issue;
  onChange: (isChecked: boolean) => void;
  project: Project;
};

export const CardHeader: Component<Props> = (props) => {
  const onCheckChange: CheckboxProps["onChange"] = () => {
    props.onChange(!props.isChecked);
  };

  return (
    <header class="flex flex-col gap-2">
      <TextFieldRoot>
        <TextFieldLabel>
          <Badge class="uppercase" variant="outline">
            {props.issue.id}
          </Badge>
          <Checkbox
            checked={props.isChecked}
            disabled={props.isPending}
            onChange={onCheckChange}
            size="xs"
          />
        </TextFieldLabel>
      </TextFieldRoot>
      <span class="text-xs font-semibold uppercase">{props.project.name}</span>
      <span class="text-sm">{props.issue.subject}</span>
    </header>
  );
};
