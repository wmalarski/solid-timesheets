import { createI18nContext } from "@solid-primitives/i18n";

const dict = {
  en: {
    dashboard: {
      create: "New",
      reset: "Reset",
      saveAll: "Save pending {{count}}",
      timeEntry: {
        cancel: "Cancel",
        comments: {
          label: "Comments",
          placeholder: "Write",
        },
        copyMonthEnd: "Copy Month End",
        copyNextDay: "Copy Next Day",
        delete: "Delete",
        hours: {
          label: "Hours",
          placeholder: "Write",
        },
        new: "New",
        pending: "Pending",
        save: "Save",
        update: "Update",
      },
      title: "Time Sheets",
    },
    footer: {
      madeBy: "Made by wmalarski",
    },
    home: {
      title: "Time Sheets",
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
