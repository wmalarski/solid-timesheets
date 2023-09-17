import { Combobox } from "@kobalte/core";
import type { Component } from "solid-js";
import { twCx } from "../utils/twCva";
import styles from "./Combobox.module.css";

export type ComboboxRootProps<Option> = Combobox.ComboboxRootProps<Option>;

export function ComboboxRoot<Option>(
  props: Combobox.ComboboxRootProps<Option>
) {
  return <Combobox.Root {...props} class={twCx("", props.class)} />;
}

export type ComboboxLabelProps = Combobox.ComboboxLabelProps;

export const ComboboxLabel: Component<Combobox.ComboboxLabelProps> = (
  props
) => {
  return <Combobox.Label {...props} class={twCx("", props.class)} />;
};

export type ComboboxDescriptionProps = Combobox.ComboboxDescriptionProps;

export const ComboboxDescription: Component<
  Combobox.ComboboxDescriptionProps
> = (props) => {
  return (
    <Combobox.Description
      {...props}
      class={twCx("mt-8 opacity-80 text-sx select-none", props.class)}
    />
  );
};

export type ComboboxErrorMessageProps = Combobox.ComboboxErrorMessageProps;

export const ComboboxErrorMessage: Component<
  Combobox.ComboboxErrorMessageProps
> = (props) => {
  return (
    <Combobox.ErrorMessage
      {...props}
      class={twCx("mt-2 text-error text-xs select-none", props.class)}
    />
  );
};

export type ComboboxControlProps<Option> =
  Combobox.ComboboxControlProps<Option>;

export function ComboboxControl<Option>(
  props: Combobox.ComboboxControlProps<Option>
) {
  return (
    <Combobox.Control
      {...props}
      class={twCx(
        "inline-flex justify-between w-52 text-base outline-none",
        "ui-invalid:border-error-content ui-invalid:text-error-content",
        styles.control,
        props.class
      )}
    />
  );
}

export type ComboboxInputProps = Combobox.ComboboxInputProps;

export const ComboboxInput: Component<Combobox.ComboboxInputProps> = (
  props
) => {
  return (
    <Combobox.Input
      {...props}
      class={twCx(
        "appearance-none inline-flex min-w-0 min-h-[40px] pl-4 bg-transparent outline-none",
        props.class
      )}
    />
  );
};

export type ComboboxTriggerProps = Combobox.ComboboxTriggerProps;

export const ComboboxTrigger: Component<Combobox.ComboboxTriggerProps> = (
  props
) => {
  return (
    <Combobox.Trigger
      {...props}
      class={twCx(
        "appearance-none inline-flex items-center justify-center w-auto outline-none px-3",
        styles.trigger,
        props.class
      )}
    />
  );
};

export type ComboboxIconProps = Combobox.ComboboxIconProps;

export const ComboboxIcon: Component<Combobox.ComboboxIconProps> = (props) => {
  return <Combobox.Icon {...props} class={twCx("h-5 w-5", props.class)} />;
};

export type ComboboxPortalProps = Combobox.ComboboxPortalProps;

export const ComboboxPortal = Combobox.Portal;

export type ComboboxContentProps = Combobox.ComboboxContentProps;

export const ComboboxContent: Component<Combobox.ComboboxContentProps> = (
  props
) => {
  return (
    <Combobox.Content
      {...props}
      class={twCx("shadow", styles.content, props.class)}
    />
  );
};

export type ComboboxArrowProps = Combobox.ComboboxArrowProps;

export const ComboboxArrow: Component<Combobox.ComboboxArrowProps> = (
  props
) => {
  return <Combobox.Arrow {...props} class={twCx("", props.class)} />;
};

export type ComboboxListboxProps<Option> =
  Combobox.ComboboxListboxProps<Option>;

export function ComboboxListbox<Option>(
  props: Combobox.ComboboxListboxProps<Option>
) {
  return (
    <Combobox.Listbox
      {...props}
      class={twCx(
        "overflow-y-auto max-h-96 p-2",
        "focus:outline-none",
        props.class
      )}
    />
  );
}

export type ComboboxSectionProps = Combobox.ComboboxSectionProps;

export const ComboboxSection: Component<Combobox.ComboboxSectionProps> = (
  props
) => {
  return (
    <Combobox.Section
      {...props}
      class={twCx("pt-2 pl-2 text-sm", props.class)}
    />
  );
};

export type ComboboxItemProps = Combobox.ComboboxItemProps;

export const ComboboxItem: Component<Combobox.ComboboxItemProps> = (props) => {
  return (
    <Combobox.Item
      {...props}
      class={twCx(
        "text-base flex items-center justify-between h-8 px-2 relative select-none outline-none",
        "ui-disabled:opacity-50 ui-disabled:pointer-events-none",
        "ui-highlighted:outline-none bg-base-200",
        props.class
      )}
    />
  );
};

export type ComboboxItemLabelProps = Combobox.ComboboxItemLabelProps;

export const ComboboxItemLabel: Component<Combobox.ComboboxItemLabelProps> = (
  props
) => {
  return <Combobox.ItemLabel {...props} class={twCx("", props.class)} />;
};

export type ComboboxItemDescriptionProps =
  Combobox.ComboboxItemDescriptionProps;

export const ComboboxItemDescription: Component<
  Combobox.ComboboxItemDescriptionProps
> = (props) => {
  return <Combobox.ItemDescription {...props} class={twCx("", props.class)} />;
};

export type ComboboxItemIndicatorProps = Combobox.ComboboxItemIndicatorProps;

export const ComboboxItemIndicator: Component<
  Combobox.ComboboxItemIndicatorProps
> = (props) => {
  return (
    <Combobox.ItemIndicator
      {...props}
      class={twCx(
        "h-5 w-5 flex flex-initial items-center justify-center",
        props.class
      )}
    />
  );
};
