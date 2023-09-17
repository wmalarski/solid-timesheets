import { IoCaretDown, IoCheckmark } from "solid-icons/io";
import { type Component } from "solid-js";
import {
  ComboboxContent,
  ComboboxControl,
  ComboboxIcon,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxListbox,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
} from "~/components/Combobox";
import type { Issue } from "~/server/types";

type IssueComboboxProps = {
  issues: Issue[];
};

export const IssueCombobox: Component<IssueComboboxProps> = (props) => {
  return (
    <ComboboxRoot
      options={props.issues}
      placeholder="Search a fruit…"
      itemComponent={(props) => (
        <ComboboxItem item={props.item}>
          <ComboboxItemLabel>{props.item.rawValue.subject}</ComboboxItemLabel>
          <ComboboxItemIndicator>
            <IoCheckmark />
          </ComboboxItemIndicator>
        </ComboboxItem>
      )}
    >
      <ComboboxControl aria-label="Fruit">
        <ComboboxInput />
        <ComboboxTrigger>
          <ComboboxIcon>
            <IoCaretDown />
          </ComboboxIcon>
        </ComboboxTrigger>
      </ComboboxControl>
      <ComboboxPortal>
        <ComboboxContent>
          <ComboboxListbox />
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  );
};
