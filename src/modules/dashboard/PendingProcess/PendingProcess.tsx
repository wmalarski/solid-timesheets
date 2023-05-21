import { useIsFetching, useIsMutating } from "@tanstack/solid-query";
import { Show, createMemo, type Component } from "solid-js";
import { ClientOnly } from "~/components/ClientOnly";
import { Progress } from "~/components/Progress";

const Client: Component = () => {
  const isMutating = useIsMutating();
  const isFetching = useIsFetching();

  const isPending = createMemo(() => {
    return isMutating() + isFetching();
  });

  return (
    <Show when={isPending() > 0}>
      <Progress />
    </Show>
  );
};

export const PendingProcess: Component = () => {
  return (
    <ClientOnly>
      <Client />
    </ClientOnly>
  );
};
