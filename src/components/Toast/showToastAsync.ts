import type { ShowToastArgs } from "./Toast";

export const showToastAsync = async (args: ShowToastArgs) => {
  const { showToast } = await import("./Toast");
  showToast(args);
};
