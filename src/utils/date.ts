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
