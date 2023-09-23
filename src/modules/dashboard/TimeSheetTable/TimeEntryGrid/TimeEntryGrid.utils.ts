import type { TimeEntry } from "~/server/types";
import type { CreatingEntryData, UpdatingEntryData } from "../EntriesStore";

const getOrSetDefault = <K, V>(
  map: Map<K, V>,
  key: K,
  fallback: () => V
): V => {
  const value = map.get(key);
  if (value !== undefined) {
    return value;
  }
  const newValue = fallback();
  map.set(key, newValue);
  return newValue;
};

export const groupTimeEntries = (entries: TimeEntry[]) => {
  const dayMap = new Map<string, TimeEntry[]>();
  const fallbackDayArray = () => new Array<TimeEntry>();

  entries.forEach((entry) => {
    const day = getOrSetDefault(dayMap, entry.spent_on, fallbackDayArray);
    day.push(entry);
  });

  return dayMap;
};

type SumTimeEntriesHoursByDayArgs = {
  dateMap: Record<string, Record<number, CreatingEntryData | undefined>>;
  timeEntries: TimeEntry[];
  updateMap: Record<number, UpdatingEntryData | undefined>;
};

export const sumTimeEntriesHoursByDay = ({
  dateMap,
  timeEntries,
  updateMap,
}: SumTimeEntriesHoursByDayArgs) => {
  const map = new Map<string, number[]>();
  const fallbackArray = () => new Array<number>();

  timeEntries.forEach((entry) => {
    const value = getOrSetDefault(map, entry.spent_on, fallbackArray);

    const updated = updateMap[entry.id];
    const hours = updated?.args.hours ?? entry.hours;

    value.push(hours);
  });

  Object.entries(dateMap).forEach(([date, entries]) => {
    const value = getOrSetDefault(map, date, fallbackArray);

    Object.values(entries).forEach((entry) => {
      if (entry) {
        value.push(entry.args.hours);
      }
    });
  });

  return map;
};

export const sumDayTimeEntriesHours = (map: Map<string, number[]>) => {
  return (
    new Array(...map.values()).flat().reduce((prev, curr) => prev + curr, 0) ||
    0
  );
};
