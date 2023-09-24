import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createSignal, type Component, type ParentProps } from "solid-js";
import { isServer } from "solid-js/web";

export const QueryProvider: Component<ParentProps> = (props) => {
  const [queryClient] = createSignal(
    new QueryClient({
      defaultOptions: {
        queries: { enabled: !isServer },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient()}>
      {props.children}
    </QueryClientProvider>
  );
};
