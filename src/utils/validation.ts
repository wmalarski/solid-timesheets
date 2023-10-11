import { coerce, date, number } from "valibot";

export const coercedDate = () => {
  return coerce(date(), (value) => new Date(String(value)));
};

export const coercedNumber = () => {
  return coerce(number(), Number);
};
