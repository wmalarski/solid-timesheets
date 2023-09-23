import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type Component,
  type ParentProps,
} from "solid-js";

const en_dict = {
  dashboard: {
    confirmDelete: {
      cancel: "Cancel",
      confirm: "Confirm",
      description: "Are you sure you want to delete this?",
      title: "Confirm the action",
    },
    createDialog: {
      cancel: "Cancel",
      submit: "Submit",
      title: "New",
    },
    report: "Download",
    reset: "Reset({{count}})",
    saveAll: "Save({{count}})",
    timeEntry: {
      comments: {
        label: "Comments",
        placeholder: "Write",
      },
      copyCurrentDay: "Copy to the same day",
      copyMonthEnd: "Copy until the end of the month",
      copyNextDay: "Copy to the next day",
      copyNextWorkingDay: "Copy to the next working day",
      copyWeekEnd: "Copy until the end of the week",
      delete: "Delete",
      hours: {
        label: "Hours",
        placeholder: "Write",
      },
      issue: {
        label: "Issue",
        placeholder: "Search",
      },
      more: "More",
      new: "New",
      pending: "Pending",
      reset: "Reset",
      save: "Save",
      tracking: "Track time",
      update: "Update",
    },
    title: "Timesheets",
    toasts: {
      create: "Created time entry",
      error: "Error",
      remove: "Time entries removed",
      saved: "Saved time entries",
      success: "Success",
      updated: "Updated time entry",
      wrong: "Something wrong happened",
    },
    tracking: {
      button: "Tracking",
      pause: "Pause",
      reset: "Reset",
      start: "Start",
      stop: "Stop",
    },
  },
  footer: {
    madeBy: "Made by wmalarski",
  },
  home: {
    title: "Timesheets",
  },
  signIn: {
    button: "Sign In",
    description: "Your API Token",
    label: "Token",
    placeholder: "Write",
    title: "Sign In",
  },
  signOut: {
    button: "Sign Out",
  },
  theme: {
    setDark: "Set dark theme",
    setLight: "Set light theme",
  },
};

export type Locale = "en";

const dictionaries = { en: en_dict };

type Accessed<T> = T extends Accessor<infer A> ? A : never;

export const createI18nValue = () => {
  const [locale, setLocale] = createSignal<Locale>("en");

  const translate = createMemo(() => {
    const dict = flatten(dictionaries[locale()]);
    return translator(() => dict, resolveTemplate);
  });

  const t: Accessed<typeof translate> = (path, ...args) => {
    return translate()(path, ...args);
  };

  return { locale, setLocale, t };
};

type I18nContextValue = ReturnType<typeof createI18nValue>;

export const I18nContext = createContext<I18nContextValue>({
  locale: () => "en" as const,
  setLocale: () => void 0,
  t: () => {
    throw new Error("Not implemented");
  },
});

export const I18nContextProvider: Component<ParentProps> = (props) => {
  const value = createI18nValue();

  return (
    <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>
  );
};

export const useI18n = () => {
  return useContext(I18nContext);
};
