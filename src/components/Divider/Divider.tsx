import type { VariantProps } from "class-variance-authority";
import { splitProps, type Component, type JSX } from "solid-js";
import { twCva } from "../utils/twCva";

export const dividerClass = twCva(["divider bg-gray-200"], {
  defaultVariants: {
    direction: "horizontal",
  },
  variants: {
    direction: {
      horizontal: ["divider-horizontal w-full h-[1px]"],
      vertical: ["divider-vertical h-full w-[1px]"],
    },
  },
});

export type DividerProps = JSX.IntrinsicElements["div"] &
  VariantProps<typeof dividerClass>;

export const Divider: Component<DividerProps> = (props) => {
  const [split, rest] = splitProps(props, ["direction"]);

  return (
    <div {...rest} class={dividerClass({ class: props.class, ...split })} />
  );
};
