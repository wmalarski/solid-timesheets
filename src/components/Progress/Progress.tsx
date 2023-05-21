import type { Component, JSX } from "solid-js";
import { twCx } from "../utils/twCva";
import styles from "./Progress.module.css";

export type ProgressProps = JSX.IntrinsicElements["div"];

export const Progress: Component<ProgressProps> = (props) => {
  return (
    <div
      {...props}
      class={twCx("absolute w-screen h-1", styles.progress, props.class)}
    />
  );
};
