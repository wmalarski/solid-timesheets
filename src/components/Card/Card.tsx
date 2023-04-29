import type { VariantProps } from "class-variance-authority";
import type { Component, JSX, ValidComponent } from "solid-js";
import { Dynamic, type DynamicProps } from "solid-js/web";
import { twCva, twCx } from "../utils/twCva";

export const cardClass = twCva("card", {
  defaultVariants: {
    size: "none",
    variant: "none",
  },
  variants: {
    size: {
      compact: "card-compact",
      none: "",
      normal: "card-normal",
      side: "card-side",
    },
    variant: {
      bordered: "card-bordered",
      none: "",
    },
  },
});

export type CardProps = JSX.IntrinsicElements["div"] &
  VariantProps<typeof cardClass>;

export const Card: Component<CardProps> = (props) => {
  return (
    <div
      {...props}
      class={cardClass({
        class: props.class,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};

export const cardTitleClass = twCva("card-title");

export type CardTitleProps<T extends ValidComponent> = DynamicProps<T>;

export function CardTitle<T extends ValidComponent>(props: CardTitleProps<T>) {
  return (
    <Dynamic
      {...props}
      component={props.component}
      class={cardTitleClass({ class: props.class })}
    />
  );
}

export type CardBodyProps = JSX.IntrinsicElements["div"];

export function CardBody(props: CardBodyProps) {
  return <div {...props} class={twCx("card-body", props.class)} />;
}

export type CardActionsProps = JSX.IntrinsicElements["div"];

export const CardActions: Component<CardActionsProps> = (props) => {
  return <div {...props} class={twCx("card-actions", props.class)} />;
};
