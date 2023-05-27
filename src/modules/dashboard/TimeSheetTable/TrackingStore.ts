import { createLocalStorage } from "@solid-primitives/storage";
import { createContext, createMemo, useContext } from "solid-js";

const itemsKey = "items";
const runningIdKey = "runningId";

type TrackingItem = {
  startDate: Date;
  startValue: number;
};

type TrackingStore = {
  items: Record<number, TrackingItem | undefined>;
  runningTimeEntryId: number | null;
};

const parseStorageItems = (input: unknown) => {
  if (!input || typeof input !== "string") {
    return {};
  }
  try {
    return JSON.parse(input) as TrackingStore["items"];
  } catch {
    return {};
  }
};

export const useTrackingStore = () => {
  const [state, setState] = createLocalStorage({ prefix: "tracking" });

  const items = createMemo(() => {
    return parseStorageItems(state[itemsKey]);
  });

  const runningId = createMemo(() => {
    return Number(state.runningIdKey) || null;
  });

  const setItems = (items: TrackingStore["items"]) => {
    setState(itemsKey, JSON.stringify(items));
  };

  const setRunningId = (runningId: number | null) => {
    setState(runningIdKey, JSON.stringify(runningId));
  };

  return { items, runningId, setItems, setRunningId };
};

type TrackingStoreContextValue = ReturnType<typeof useTrackingStore>;

export const TrackingStoreContext = createContext<TrackingStoreContextValue>({
  items: () => ({}),
  runningId: () => null,
  setItems: () => void 0,
  setRunningId: () => void 0,
});

export const useTrackingStoreContext = () => {
  return useContext(TrackingStoreContext);
};
