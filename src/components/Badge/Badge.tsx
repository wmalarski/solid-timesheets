import { type VariantProps } from "class-variance-authority";
import { splitProps, type Component, type JSX } from "solid-js";
import { twCva } from "../utils/twCva";

export const badgeClass = twCva("badge", {
  defaultVariants: {
    color: "none",
    size: "md",
    variant: "none",
  },
  variants: {
    color: {
      accent: "badge-accent",
      error: "badge-error",
      ghost: "badge-ghost",
      info: "badge-info",
      none: "",
      primary: "badge-primary",
      secondary: "badge-secondary",
      success: "badge-success",
      warning: "badge-warning",
    },
    size: {
      lg: "badge-lg",
      md: "badge-md",
      sm: "badge-sm",
      xs: "badge-xs",
    },
    variant: {
      none: "",
      outline: "badge-outline",
    },
  },
});

export type BadgeProps = JSX.IntrinsicElements["div"] &
  VariantProps<typeof badgeClass>;

export const Badge: Component<BadgeProps> = (props) => {
  const [split, rest] = splitProps(props, ["variant", "size", "color"]);

  return <div {...rest} class={badgeClass({ class: props.class, ...split })} />;
};
