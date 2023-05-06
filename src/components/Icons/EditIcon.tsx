import type { Component, JSX } from "solid-js";

export const EditIcon: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 13V16H7L16 7L13 4L4 13Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        stroke-width="2"
      />
    </svg>
  );
};