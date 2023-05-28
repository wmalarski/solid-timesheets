import { createLocalStorage } from "@solid-primitives/storage";
import { createContext, createMemo, useContext } from "solid-js";

const itemsKey = "items";
const runningIdKey = "runningId";

export type TrackingItem = {
  startDate: Date;
  startValue: number;
};

type TrackingStore = Record<number, TrackingItem | undefined>;

type SetItemArgs = {
  item: TrackingItem;
  trackingId: number;
  isRunning: boolean;
};

const parseStorageItems = (input: unknown) => {
  if (!input || typeof input !== "string") {
    return {};
  }
  try {
    return JSON.parse(input) as TrackingStore;
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

  const setItems = (items: TrackingStore) => {
    setState(itemsKey, JSON.stringify(items));
  };

  const setRunningId = (runningId: number | null) => {
    setState(runningIdKey, JSON.stringify(runningId));
  };

  const setItem = ({ isRunning, item, trackingId }: SetItemArgs) => {
    const next = { ...items() };
    next[trackingId] = item;
    setItems(next);

    if (isRunning) {
      setRunningId(trackingId);
    }
  };

  return { items, runningId, setItem, setRunningId };
};

type TrackingStoreContextValue = ReturnType<typeof useTrackingStore>;

export const TrackingStoreContext = createContext<TrackingStoreContextValue>({
  items: () => ({}),
  runningId: () => null,
  setItem: () => void 0,
  setRunningId: () => void 0,
});

export const useTrackingStoreContext = () => {
  return useContext(TrackingStoreContext);
};
