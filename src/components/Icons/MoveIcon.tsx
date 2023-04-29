import type { Component, JSX } from "solid-js";

export const MoveIcon: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 4H16V10" stroke="currentColor" stroke-width="2" />
      <path d="M16 4L8 12" stroke="currentColor" stroke-width="2" />
      <path d="M8 6H4V16H14V12" stroke="currentColor" stroke-width="2" />
    </svg>
  );
};
