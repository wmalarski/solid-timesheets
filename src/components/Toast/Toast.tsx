import { Toast } from "@kobalte/core";
import type { Component, JSX } from "solid-js";
import { twCx } from "../utils/twCva";

const ToastRegion = Toast.Region;

const ToastList: Component<Toast.ToastListProps> = (props) => {
  return (
    <Toast.List
      {...props}
      class={twCx(
        "p-4 fixed bottom-0 right-0 flex gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none",
        props.class
      )}
    />
  );
};

export const ToastRoot: Component<Toast.ToastRootProps> = (props) => {
  return (
    <Toast.Root
      {...props}
      class={twCx(
        "flex flex-col items-center justify-between gap-2 p-3 bg-white",
        "ui-opened:animate-slideIn ui-opened:duration-150 ui-opened:ease-out",
        "ui-closed:animate-hide ui-closed:duration-100 ui-closed:ease-in",
        "ui-swipe-move:translate-x-[var(--kb-toast-swipe-move-x)]",
        "ui-swipe-cancel:translate-x-0 ui-swipe-cancel:transition-transform",
        "ui-swipe-end:animate-swipeOut ui-swipe-end:duration-100 ui-swipe-end:ease-out",
        props.class
      )}
    />
  );
};

export const ToastContent: Component<JSX.IntrinsicElements["div"]> = (
  props
) => {
  return (
    <div {...props} class={twCx("flex items-start w-full", props.class)} />
  );
};

export const ToastCloseButton: Component<Toast.ToastCloseButtonProps> = (
  props
) => {
  return (
    <Toast.CloseButton
      {...props}
      class={twCx("shrink-0 h-4 w-4 ml-auto", props.class)}
    />
  );
};

export const ToastTitle: Component<Toast.ToastTitleProps> = (props) => {
  return (
    <Toast.Title
      {...props}
      class={twCx("text-base font-medium", props.class)}
    />
  );
};

export const ToastDescription: Component<Toast.ToastDescriptionProps> = (
  props
) => {
  return <Toast.Description {...props} class={twCx("text-sm", props.class)} />;
};

export const ToastProgressTrack: Component<Toast.ToastProgressTrackProps> = (
  props
) => {
  return (
    <Toast.ProgressTrack
      {...props}
      class={twCx("h-2 w-full bg-accent rounded-sm", props.class)}
    />
  );
};

export const ToastProgressFill: Component<Toast.ToastProgressFillProps> = (
  props
) => {
  return (
    <Toast.ProgressFill
      {...props}
      class={twCx(
        "bg-base-300 rounded-sm h-full",
        "w-[var(--kb-toast-progress-fill-width)] transition-[width] duration-200 ease-linear",
        props.class
      )}
    />
  );
};

export const ToastProvider: Component = () => {
  return (
    <></>
    // <ToastRegion>
    //   <ToastList />
    // </ToastRegion>
  );
};
