import { createMemo } from "solid-js";
import { useSearchParams } from "solid-start";
import { getDateOrNow, getFirstDayOfMonth } from "~/utils/date";
import { formatRequestDate } from "~/utils/format";

export const useTimeSheetSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedDate = createMemo(() => {
    const date = getDateOrNow(searchParams.date);
    return getFirstDayOfMonth(date);
  });

  const setMonth = (date: Date) => {
    setSearchParams({ date: formatRequestDate(date) });
  };

  return { selectedDate, setMonth };
};
