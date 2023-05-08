import { type VariantProps } from "class-variance-authority";
import { splitProps, type Component, type JSX } from "solid-js";
import { twCva } from "../utils/twCva";

export const checkboxClass = twCva("checkbox", {
  defaultVariants: {
    color: "none",
    size: "md",
  },
  variants: {
    color: {
      accent: "checkbox-accent",
      error: "checkbox-error",
      info: "checkbox-info",
      none: "",
      primary: "checkbox-primary",
      secondary: "checkbox-secondary",
      success: "checkbox-success",
      warning: "checkbox-warning",
    },
    size: {
      lg: "checkbox-lg",
      md: "checkbox-md",
      sm: "checkbox-sm",
      xs: "checkbox-xs",
    },
  },
});

export type CheckboxProps = JSX.IntrinsicElements["input"] &
  VariantProps<typeof checkboxClass>;

export const Checkbox: Component<CheckboxProps> = (props) => {
  const [split, rest] = splitProps(props, ["size", "color"]);

  return (
    <input
      type="checkbox"
      {...rest}
      class={checkboxClass({ class: props.class, ...split })}
    />
  );
};
