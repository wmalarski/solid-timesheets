// @refresh reload
import { I18nContext } from "@solid-primitives/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Suspense, createSignal } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";
import { i18n } from "./utils/i18n";

export default function Root() {
  const [queryClient] = createSignal(new QueryClient());

  return (
    <I18nContext.Provider value={i18n}>
      <Html lang="en" data-theme="cyberpunk">
        <Head>
          <Title>SolidStart - With TailwindCSS</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Body>
          <Suspense>
            <ErrorBoundary>
              <QueryClientProvider client={queryClient()}>
                <Routes>
                  <FileRoutes />
                </Routes>
              </QueryClientProvider>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </Body>
      </Html>
    </I18nContext.Provider>
  );
}
