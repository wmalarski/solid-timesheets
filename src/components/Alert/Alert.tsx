import { type VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { ErrorIcon } from "../Icons/ErrorIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import { SuccessIcon } from "../Icons/SuccessIcon";
import { WarningIcon } from "../Icons/WarningIcon";
import { twCva } from "../utils/twCva";

export const alertClass = twCva("alert justify-start", {
  defaultVariants: {
    variant: "none",
  },
  variants: {
    variant: {
      error: "alert-error",
      info: "alert-info",
      none: "",
      success: "alert-success",
      warning: "alert-warning",
    },
  },
});

export type AlertProps = JSX.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertClass>;

export const Alert: Component<AlertProps> = (props) => {
  return (
    <div
      {...props}
      class={alertClass({ class: props.class, variant: props.variant })}
    />
  );
};

const alertIconMap: Record<
  "error" | "info" | "success" | "warning",
  Component<JSX.SvgSVGAttributes<SVGSVGElement>>
> = {
  error: ErrorIcon,
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
};

export type AlertIconProps = {
  variant: keyof typeof alertIconMap;
};

export const AlertIcon: Component<AlertIconProps> = (props) => {
  const component = () => {
    return alertIconMap[props.variant];
  };
  return (
    <Dynamic component={component()} class="h-6 w-6 shrink-0 stroke-current" />
  );
};
