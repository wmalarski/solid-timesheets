import { createI18nContext } from "@solid-primitives/i18n";

const dict = {
  en: {
    dashboard: {
      create: "New",
      report: "Download",
      reset: "Reset ({{count}})",
      saveAll: "Save ({{count}})",
      timeEntry: {
        comments: {
          label: "Comments",
          placeholder: "Write",
        },
        copyCurrentDay: "Copy to the same day",
        copyMonthEnd: "Copy until the end of the month",
        copyNextDay: "Copy to the next day",
        copyWeekEnd: "Copy until the end of the week",
        delete: "Delete",
        hours: {
          label: "Hours",
          placeholder: "Write",
        },
        more: "More",
        new: "New",
        pending: "Pending",
        reset: "Reset",
        save: "Save",
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
