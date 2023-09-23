// @refresh reload
import { I18nProvider } from "@kobalte/core";
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Html,
  Routes,
  Scripts,
} from "solid-start";
import { I18nContextProvider } from "./contexts/I18nContext";
import { QueryProvider } from "./contexts/QueryProvider";
import { ThemeContext, createThemeValue } from "./contexts/ThemeContext";
import { Head } from "./modules/common/Head";
import "./root.css";

export default function Root() {
  const themeValue = createThemeValue();

  return (
    <ThemeContext.Provider value={themeValue}>
      <I18nContextProvider>
        <I18nProvider locale="en">
          <Html lang="en" data-theme={themeValue.theme()}>
            <Head />
            <Body>
              <Suspense>
                <ErrorBoundary>
                  <QueryProvider>
                    <Routes>
                      <FileRoutes />
                    </Routes>
                  </QueryProvider>
                </ErrorBoundary>
              </Suspense>
              <Scripts />
            </Body>
          </Html>
        </I18nProvider>
      </I18nContextProvider>
    </ThemeContext.Provider>
  );
}
