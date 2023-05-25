import type { VariantProps } from "class-variance-authority";
import { splitProps, type Component, type JSX } from "solid-js";
import { twCva } from "~/components/utils/twCva";

export const gridCellClass = twCva("border-base-300 p-2", {
  defaultVariants: {
    bg: null,
    borders: null,
    sticky: null,
  },
  variants: {
    bg: {
      "base-100": "bg-base-100",
      "base-200": "bg-base-200",
    },
    borders: {
      bottom: "border-b-[1px]",
      bottomRight: "border-b-[1px] border-r-[1px]",
      left: "border-l-[1px]",
      right: "border-r-[1px]",
      top: "border-t-[1px]",
      topLeft: "border-l-[1px] border-t-[1px]",
    },
    sticky: {
      bottom: "sticky bottom-0",
      bottomRight: "sticky bottom-0 right-0 ",
      top: "sticky top-0",
      topRight: "sticky right-0 top-0",
    },
  },
});

export type GridCellProps = JSX.IntrinsicElements["div"] &
  VariantProps<typeof gridCellClass>;

export const GridCell: Component<GridCellProps> = (props) => {
  const [split, rest] = splitProps(props, ["borders", "bg", "sticky"]);

  return (
    <div {...rest} class={gridCellClass({ class: props.class, ...split })} />
  );
};
