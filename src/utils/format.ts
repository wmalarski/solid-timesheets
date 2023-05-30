import { useI18n } from "@solid-primitives/i18n";

export const formatRequestDate = (date: Date) => {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
};

export const formatMonth = (date: Date) => {
  const [, { locale }] = useI18n();

  return Intl.DateTimeFormat(locale(), {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatDay = (date: Date) => {
  const [, { locale }] = useI18n();

  return Intl.DateTimeFormat(locale(), { day: "numeric" }).format(date);
};

export const formatWeekday = (date: Date) => {
  const [, { locale }] = useI18n();

  return Intl.DateTimeFormat(locale(), { weekday: "long" }).format(date);
};

export const formatTime = (seconds: number) => {
  const [, { locale }] = useI18n();

  const hours = Math.floor((seconds / (1000 * 60 * 60)) % 24);

  const secondsMinutes = Intl.DateTimeFormat(locale(), {
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(seconds * 1000));

  return `${hours}:${secondsMinutes}`;
};
