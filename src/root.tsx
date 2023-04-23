// @refresh reload
import { I18nContext } from "@solid-primitives/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Suspense, createSignal } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  useLocation,
} from "solid-start";
import "./root.css";
import { i18n } from "./utils/i18n";

export default function Root() {
  const [queryClient] = createSignal(new QueryClient());

  const location = useLocation();
  const active = (path: string) =>
    path === location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <Html lang="en" data-theme="cyberpunk">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <I18nContext.Provider value={i18n}>
              <QueryClientProvider client={queryClient()}>
                <nav class="bg-sky-800">
                  <ul class="container flex items-center p-3 text-gray-200">
                    <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
                      <A href="/">Home</A>
                    </li>
                    <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
                      <A href="/about">About</A>
                    </li>
                  </ul>
                </nav>
                <Routes>
                  <FileRoutes />
                </Routes>
              </QueryClientProvider>
            </I18nContext.Provider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
