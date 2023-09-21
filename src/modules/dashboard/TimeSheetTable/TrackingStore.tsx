import { createLocalStorage } from "@solid-primitives/storage";
import {
  createContext,
  createMemo,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";
import { secondsToNow } from "~/utils/date";

const itemsKey = "items";
const runningIdKey = "runningId";

export type TrackingItem = {
  startDate: string;
  startValue: number;
};

type TrackingStore = Record<number, TrackingItem | undefined>;

type SetItemArgs = {
  item?: TrackingItem;
  trackingId: number;
};

const parseStorageItems = (input: unknown): TrackingStore => {
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
    return Number(state[runningIdKey]) || null;
  });

  const setItems = (items: TrackingStore) => {
    setState(itemsKey, JSON.stringify(items));
  };

  const setRunningId = (runningId: number | null) => {
    setState(runningIdKey, JSON.stringify(runningId));
  };

  const setItem = ({ item, trackingId }: SetItemArgs) => {
    const next = { ...items() };

    next[trackingId] = item;
    setItems(next);
  };

  const stopCount = (id: number) => {
    const current = items()[id];
    if (!current) {
      return;
    }
    const startValue = current.startValue + secondsToNow(current.startDate);
    const newItem = { startDate: new Date().toJSON(), startValue };
    setItem({ item: newItem, trackingId: id });
  };

  const pause = (id: number) => {
    stopCount(id);
    if (runningId() === id) {
      setRunningId(null);
    }
  };

  const reset = (id: number) => {
    setItem({ item: undefined, trackingId: id });
    if (runningId() === id) {
      setRunningId(null);
    }
  };

  const start = (id: number) => {
    const currentlyRunningId = runningId();
    if (currentlyRunningId) {
      stopCount(currentlyRunningId);
    }
    const startValue = items()[id]?.startValue || 0;
    const newItem = { startDate: new Date().toJSON(), startValue };
    setItem({ item: newItem, trackingId: id });
    setRunningId(id);
  };

  return { items, pause, reset, runningId, setItem, setRunningId, start };
};

type TrackingStoreContextValue = ReturnType<typeof useTrackingStore>;

const TrackingStoreContext = createContext<TrackingStoreContextValue>({
  items: () => ({}),
  pause: () => void 0,
  reset: () => void 0,
  runningId: () => null,
  setItem: () => void 0,
  setRunningId: () => void 0,
  start: () => void 0,
});

export const useTrackingStoreContext = () => {
  return useContext(TrackingStoreContext);
};

export const TrackingStoreProvider: Component<ParentProps> = (props) => {
  const trackingStore = useTrackingStore();

  return (
    <TrackingStoreContext.Provider value={trackingStore}>
      {props.children}
    </TrackingStoreContext.Provider>
  );
};
