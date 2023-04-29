import { type VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { twCva } from "../utils/twCva";

export const selectClass = twCva("select", {
  defaultVariants: {
    color: "none",
    size: "md",
    variant: "none",
  },
  variants: {
    color: {
      accent: "select-accent",
      error: "select-error",
      info: "select-info",
      none: "",
      primary: "select-primary",
      secondary: "select-secondary",
      success: "select-success",
      warning: "select-warning",
    },
    size: {
      lg: "select-lg",
      md: "select-md",
      sm: "select-sm",
      xs: "select-xs",
    },
    variant: {
      bordered: "select-bordered",
      ghost: "select-ghost",
      none: "",
    },
  },
});

export type SelectProps = JSX.IntrinsicElements["select"] &
  VariantProps<typeof selectClass>;

export const Select: Component<SelectProps> = (props) => {
  return (
    <select
      {...props}
      class={selectClass({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};

export type OptionProps = JSX.IntrinsicElements["option"];

export const Option: Component<OptionProps> = (props) => {
  return <option {...props} />;
};
