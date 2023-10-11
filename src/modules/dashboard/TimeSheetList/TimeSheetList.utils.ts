import { createMemo } from "solid-js";
import { useSearchParams } from "solid-start";
import { object, optional, safeParse, type Output } from "valibot";
import { getPreviousMonth } from "~/utils/date";
import { formatRequestDate } from "~/utils/format";
import { coercedDate, coercedNumber } from "~/utils/validation";

const currentDate = new Date();
const previousMonthDate = getPreviousMonth(new Date());

const paramsSchema = object({
  from: optional(coercedDate(), previousMonthDate),
  issue: optional(coercedNumber()),
  to: optional(coercedDate(), currentDate),
});

type ListSearchParams = Output<typeof paramsSchema>;

const listSearchParamsDefault: ListSearchParams = {
  from: previousMonthDate,
  to: currentDate,
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
      issue: params.issue,
      to: formatRequestDate(params.to),
    });
  };

  return { params, setParams };
};
