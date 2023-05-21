import { createContext, useContext } from "solid-js";

type DashboardConfigContextValue = () => {
  fullName: string;
  rmBaseUrl: string;
};

export const DashboardConfigContext =
  createContext<DashboardConfigContextValue>(() => ({
    fullName: "",
    rmBaseUrl: "",
  }));

export const useDashboardConfig = () => {
  return useContext(DashboardConfigContext);
};
