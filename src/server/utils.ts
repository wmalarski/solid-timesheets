import { ServerError } from "solid-start/server";
import { safeParseAsync, type Input, type ObjectSchema } from "valibot";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormParseArgs<T extends ObjectSchema<any>> = {
  form: FormData;
  schema: T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formParse = async <T extends ObjectSchema<any>>({
  form,
  schema,
}: FormParseArgs<T>): Promise<Input<T>> => {
  const entries = Object.fromEntries(form.entries());

  const parsed = await safeParseAsync(schema, entries);

  if (!parsed.success) {
    throw new ServerError(JSON.stringify(parsed.issues));
  }

  return parsed.output;
};

export const removeInvalidCharacters = (text: string) => {
  return text.replace(/[\u0250-\ue007]/g, "");
};
