export const formatRequestDate = (date: Date) => {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
};

type FormatDayArgs = {
  date: Date;
  locale: string;
};

export const formatDay = ({ date, locale }: FormatDayArgs) => {
  return Intl.DateTimeFormat(locale, { day: "numeric" }).format(date);
};

type FormatWeekdayArgs = {
  date: Date;
  locale: string;
};

export const formatWeekday = ({ date, locale }: FormatWeekdayArgs) => {
  return Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
};

type FormatTimeArgs = {
  time: number;
  locale: string;
};

export const formatTime = ({ time, locale }: FormatTimeArgs) => {
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

  const secondsMinutes = Intl.DateTimeFormat(locale, {
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(time * 1000));

  return `${hours}:${secondsMinutes}`;
};
