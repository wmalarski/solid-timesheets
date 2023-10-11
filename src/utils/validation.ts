import { coerce, date, number, regex, string, transform } from "valibot";

export const coercedDate = () => {
  return coerce(date(), (value) => new Date(String(value)));
};

export const coercedNumber = () => {
  return coerce(number(), Number);
};

export const coercedListOfNumbers = () => {
  return transform(string([regex(/^(\d+,)*\d+$/)]), (value) =>
    value.split(",").map(Number)
  );
};
