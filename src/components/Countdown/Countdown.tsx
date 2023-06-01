import { createMemo, splitProps, type Component, type JSX } from "solid-js";
import { twCx } from "~/components/utils/twCva";
import { secondsToParts } from "~/utils/date";

export type CountdownRootProps = JSX.IntrinsicElements["span"];

export const CountdownRoot: Component<CountdownRootProps> = (props) => {
  return <span {...props} class={twCx("countdown", props.class)} />;
};

export type CountdownItemProps = JSX.IntrinsicElements["span"] & {
  count: number;
};

export const CountdownItem: Component<CountdownItemProps> = (props) => {
  const [split, rest] = splitProps(props, ["count"]);

  return (
    <span
      {...rest}
      style={{ "--value": Math.max(0, Math.min(Math.floor(split.count), 99)) }}
    />
  );
};

export type CountdownProps = {
  seconds: number;
};

export const Countdown: Component<CountdownProps> = (props) => {
  const parts = createMemo(() => {
    return secondsToParts(props.seconds);
  });

  return (
    <CountdownRoot>
      <CountdownItem count={parts().hours} />:
      <CountdownItem count={parts().minutes} />:
      <CountdownItem count={parts().seconds} />
    </CountdownRoot>
  );
};
