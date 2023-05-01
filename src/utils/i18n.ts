import { createI18nContext } from "@solid-primitives/i18n";

const dict = {
  en: {
    dashboard: {
      timeEntry: {
        cancel: "Cancel",
        comments: {
          label: "Comments",
          placeholder: "Write",
        },
        delete: "Delete",
        hours: {
          label: "Hours",
          placeholder: "Write",
        },
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
