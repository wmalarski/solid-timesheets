export const getDateOrNow = (arg: string) => {
  const date = new Date(arg);
  const isInvalid = isNaN(date.getTime());
  return isInvalid ? new Date() : date;
};

export const getPreviousMonth = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() - 1);
  return copy;
};

export const getNextMonth = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() + 1);
  return copy;
};

export const getNextDay = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + 1);
  return copy;
};

export const getFirstDayOfMonth = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCDate(1);
  return copy;
};

export const getDaysCountInMonth = (start: Date) => {
  const date = new Date(start);
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCDate(0);

  return date.getUTCDate();
};

export const getDaysInMonth = (start: Date) => {
  const count = getDaysCountInMonth(start);

  return Array(count)
    .fill(0)
    .map((_, index) => {
      const entry = new Date(start);
      entry.setUTCDate(index + 1);
      return entry;
    });
};

export const getDaysLeftInMonth = (start: Date) => {
  const startDay = start.getUTCDate();

  return getDaysInMonth(start).slice(startDay);
};

const daysOffUTC = [0, 6];

export const isDayOff = (date: Date) => {
  const day = date.getUTCDay();

  return daysOffUTC.includes(day);
};

export const getDaysLeftInWeek = (start: Date) => {
  const daysLeftInMonth = getDaysLeftInMonth(start);
  const firstWeekendDay = daysLeftInMonth.findIndex(isDayOff);
  return daysLeftInMonth.slice(0, firstWeekendDay);
};

export const getFirstWorkingDay = (start: Date) => {
  const daysLeftInMonth = getDaysLeftInMonth(start);
  const firstWorkingDay = daysLeftInMonth.find((day) => !isDayOff(day));
  return firstWorkingDay;
};

export const isToday = (date: Date) => {
  const today = new Date();

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
};

export const secondsToNow = (start: Date | string) => {
  const nowTime = new Date().getTime();
  const startTime = new Date(start).getTime() || 0;

  const diffSeconds = (nowTime - startTime) / 1000;

  return diffSeconds;
};

export const secondsToParts = (arg: number) => {
  const date = new Date(0);
  date.setSeconds(arg);
  const timeString = date.toISOString().substring(11, 19);
  const [hours, minutes, seconds] = timeString.split(":");
  return { hours: +hours, minutes: +minutes, seconds: +seconds };
};
