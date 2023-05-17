import { createI18nContext } from "@solid-primitives/i18n";

const dict = {
  en: {
    dashboard: {
      create: "New",
      reset: "Reset",
      saveAll: "Save",
      timeEntry: {
        comments: {
          label: "Comments",
          placeholder: "Write",
        },
        copyCurrentDay: "Copy",
        copyMonthEnd: "Copy Month End",
        copyNextDay: "Copy Next Day",
        delete: "Delete",
        hours: {
          label: "Hours",
          placeholder: "Write",
        },
        more: "More",
        new: "New",
        pending: "Pending",
        save: "Save",
        update: "Update",
      },
      title: "Timesheets",
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
  },
};

export const i18n = createI18nContext(dict, "en");
