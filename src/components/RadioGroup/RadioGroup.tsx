import { RadioGroup } from "@kobalte/core";
import type { Component, JSX } from "solid-js";
import { twCx } from "../utils/twCva";
import styles from "./RadioGroup.module.css";

export type RadioGroupRootProps = RadioGroup.RadioGroupRootProps;

export const RadioGroupRoot: Component<RadioGroupRootProps> = (props) => {
  return (
    <RadioGroup.Root
      {...props}
      class={twCx("flex flex-col gap-2", props.class)}
    />
  );
};

export type RadioGroupLabelProps = RadioGroup.RadioGroupLabelProps;

export const RadioGroupLabel: Component<RadioGroupLabelProps> = (props) => {
  return (
    <RadioGroup.Label
      {...props}
      class={twCx("text-sm select-none font-semibold", props.class)}
    />
  );
};

export type RadioGroupDescriptionProps = RadioGroup.RadioGroupDescriptionProps;

export const RadioGroupDescription: Component<RadioGroupDescriptionProps> = (
  props
) => {
  return (
    <RadioGroup.Description
      {...props}
      class={twCx("text-xs select-none", props.class)}
    />
  );
};

export type RadioGroupErrorMessageProps =
  RadioGroup.RadioGroupErrorMessageProps;

export const RadioGroupErrorMessage: Component<RadioGroupErrorMessageProps> = (
  props
) => {
  return (
    <RadioGroup.ErrorMessage
      {...props}
      class={twCx("text-xs select-none text-error-content", props.class)}
    />
  );
};

export type RadioGroupItemsProps = JSX.IntrinsicElements["div"];

export const RadioGroupItems: Component<RadioGroupItemsProps> = (props) => {
  return <div {...props} class={twCx("flex gap-4", props.class)} />;
};

export type RadioGroupItemProps = RadioGroup.RadioGroupItemProps;

export const RadioGroupItem: Component<RadioGroupItemProps> = (props) => {
  return (
    <RadioGroup.Item
      {...props}
      class={twCx("flex items-center", props.class)}
    />
  );
};

export type RadioGroupItemInputProps = RadioGroup.RadioGroupItemInputProps;

export const RadioGroupItemInput: Component<RadioGroupItemInputProps> = (
  props
) => {
  return (
    <RadioGroup.ItemInput {...props} class={twCx(styles.input, props.class)} />
  );
};

export type RadioGroupItemControlProps = RadioGroup.RadioGroupItemControlProps;

export const RadioGroupItemControl: Component<RadioGroupItemControlProps> = (
  props
) => {
  return (
    <RadioGroup.ItemControl
      {...props}
      class={twCx(
        "flex items-center, justify-center h-5 w-5 rounded-xl border bg-white text-prima",
        "ui-checked:border-primary-content ui-checked:bg-primary",
        "ui-checked:ui-invalid:border-error-content ui-checked:ui-invalid:bg-error",
        styles.control,
        props.class
      )}
    />
  );
};

export type RadioGroupItemIndicatorProps =
  RadioGroup.RadioGroupItemIndicatorProps;

export const RadioGroupItemIndicator: Component<
  RadioGroupItemIndicatorProps
> = (props) => {
  return (
    <RadioGroup.ItemIndicator
      {...props}
      class={twCx("w-2 h-2 rounded-md bg-white", props.class)}
    />
  );
};

export type RadioGroupItemLabelProps = RadioGroup.RadioGroupItemLabelProps;

export const RadioGroupItemLabel: Component<RadioGroupItemLabelProps> = (
  props
) => {
  return (
    <RadioGroup.ItemLabel
      {...props}
      class={twCx("ml-3 text-sm select-none", props.class)}
    />
  );
};

export type RadioGroupItemDescriptionProps =
  RadioGroup.RadioGroupItemDescriptionProps;

export const RadioGroupItemDescription: Component<
  RadioGroupItemDescriptionProps
> = (props) => {
  return (
    <RadioGroup.ItemDescription {...props} class={twCx("", props.class)} />
  );
};
