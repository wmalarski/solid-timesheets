import server$, { ServerError, useRequest } from "solid-start/server";
import type { z } from "zod";

type ZodFormParse<T extends z.ZodTypeAny> = {
  form: FormData;
  schema: T;
};

export const zodFormParse = async <T extends z.ZodTypeAny>({
  form,
  schema,
}: ZodFormParse<T>): Promise<z.infer<T>> => {
  const entries = Object.fromEntries(form.entries());

  const parsed = await schema.safeParseAsync(entries);

  if (!parsed.success) {
    throw new ServerError(JSON.stringify(parsed.error.issues));
  }

  return parsed.data;
};

export const getEventContext = () => {
  const event = useRequest();
  const fetch = server$.fetch || event.fetch;
  const request = server$.request || event.request;
  return { fetch, request };
};
