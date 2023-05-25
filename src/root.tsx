// @refresh reload
import { I18nProvider } from "@kobalte/core";
import { I18nContext } from "@solid-primitives/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Suspense, createSignal } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Html,
  Routes,
  Scripts,
} from "solid-start";
import { Head } from "./modules/common/Head";
import "./root.css";
import { i18n } from "./utils/i18n";

export default function Root() {
  const [queryClient] = createSignal(new QueryClient());

  return (
    <I18nContext.Provider value={i18n}>
      <I18nProvider locale="en">
        <Html lang="en" data-theme="cyberpunk-light">
          <Head />
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
      </I18nProvider>
    </I18nContext.Provider>
  );
}
