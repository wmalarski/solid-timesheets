import type { VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { twCva, twCx } from "../utils/twCva";

export type TextFieldRootProps = JSX.IntrinsicElements["fieldset"];

export const TextFieldRoot: Component<TextFieldRootProps> = (props) => {
  return <fieldset {...props} class={twCx("form-control", props.class)} />;
};

export type TextFieldLabelProps = JSX.IntrinsicElements["label"];

export const TextFieldLabel: Component<TextFieldLabelProps> = (props) => {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label {...props} class={twCx("label label-text", props.class)} />
  );
};

export type TextFieldDescriptionProps = JSX.IntrinsicElements["span"];

export const TextFieldDescription: Component<TextFieldDescriptionProps> = (
  props
) => {
  return <span {...props} class={twCx("label label-text-alt", props.class)} />;
};

export type TextFieldErrorMessageProps = JSX.IntrinsicElements["span"];

export const TextFieldErrorMessage: Component<TextFieldErrorMessageProps> = (
  props
) => {
  return <span {...props} class={twCx("text-sm text-red-400", props.class)} />;
};

export const textFieldInputClass = twCva("input", {
  defaultVariants: {
    color: "none",
    size: "md",
    variant: "none",
  },
  variants: {
    color: {
      accent: "input-accent",
      error: "input-error",
      info: "input-info",
      none: "",
      primary: "input-primary",
      secondary: "input-secondary",
      success: "input-success",
      warning: "input-warning",
    },
    size: {
      lg: "input-lg",
      md: "input-md",
      sm: "input-sm",
      xs: "input-xs",
    },
    variant: {
      bordered: "input-bordered",
      ghost: "input-ghost",
      none: "",
    },
  },
});

export type TextFieldInputProps = JSX.IntrinsicElements["input"] &
  VariantProps<typeof textFieldInputClass>;

export const TextFieldInput: Component<TextFieldInputProps> = (props) => {
  return (
    <input
      {...props}
      class={textFieldInputClass({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};

export type TextFieldTextAreaProps = JSX.IntrinsicElements["textarea"] &
  VariantProps<typeof textFieldInputClass>;

export const TextFieldTextArea: Component<TextFieldTextAreaProps> = (props) => {
  return (
    <textarea
      {...props}
      class={textFieldInputClass({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};
