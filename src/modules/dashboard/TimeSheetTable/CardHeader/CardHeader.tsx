import type { Component, JSX } from "solid-js";
import { Badge } from "~/components/Badge";
import { Checkbox, type CheckboxProps } from "~/components/Checkbox";
import { TextFieldLabel, TextFieldRoot } from "~/components/TextField";
import type { Issue } from "~/server/types";

type Props = {
  isChecked: boolean;
  isPending: boolean;
  issue: Issue;
  onChange: (isChecked: boolean) => void;
  menu: JSX.Element;
};

export const CardHeader: Component<Props> = (props) => {
  const onCheckChange: CheckboxProps["onChange"] = () => {
    props.onChange(!props.isChecked);
  };

  return (
    <header class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <TextFieldRoot class="grow">
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
        {props.menu}
      </div>
      <span class="text-xs font-semibold uppercase">
        {props.issue.project.name}
      </span>
      <span class="text-base">{props.issue.subject}</span>
    </header>
  );
};
