import { createContext, useContext } from "solid-js";

type DashboardConfigContextValue = () => {
  fullName: string;
  rmBaseUrl: string;
  userId: number;
};

export const DashboardConfigContext =
  createContext<DashboardConfigContextValue>(() => ({
    fullName: "",
    rmBaseUrl: "",
    userId: 0,
  }));

export const useDashboardConfig = () => {
  return useContext(DashboardConfigContext);
};
