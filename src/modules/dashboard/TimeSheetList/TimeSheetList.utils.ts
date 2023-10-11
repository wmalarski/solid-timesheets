import { createMemo } from "solid-js";
import { useSearchParams } from "solid-start";
import {
  date,
  object,
  optional,
  regex,
  safeParse,
  string,
  transform,
  type Output,
} from "valibot";
import { getPreviousMonth } from "~/utils/date";
import { formatRequestDate } from "~/utils/format";

const currentDate = new Date();
const previousMonthDate = getPreviousMonth(new Date());

const paramsSchema = object({
  from: optional(date(), previousMonthDate),
  issues: optional(
    transform(string([regex(/^(\d+,)*\d+$/)]), (value) =>
      value.split(",").map(Number)
    ),
    ""
  ),
  to: optional(date(), currentDate),
});

type ListSearchParams = Output<typeof paramsSchema>;

const listSearchParamsDefault: ListSearchParams = {
  from: currentDate,
  issues: [],
  to: previousMonthDate,
};

export const useListParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = createMemo(() => {
    const result = safeParse(paramsSchema, searchParams);
    return result.success ? result.output : listSearchParamsDefault;
  });

  const setParams = (params: ListSearchParams) => {
    setSearchParams({
      from: formatRequestDate(params.from),
      issues: params.issues.join(","),
      to: formatRequestDate(params.to),
    });
  };

  return { params, setParams };
};
