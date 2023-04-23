import { useI18n } from "@solid-primitives/i18n";

export const useNumberFormatter = () => {
  const [, { locale }] = useI18n();

  return (value: number) => {
    return new Intl.NumberFormat(locale(), {
      minimumFractionDigits: 2,
    }).format(value);
  };
};

export const useDateFormatter = () => {
  const [, { locale }] = useI18n();

  return (value: string | Date) => {
    return new Intl.DateTimeFormat(locale()).format(new Date(value));
  };
};
