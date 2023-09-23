import { getSessionOrThrow } from "./session";

type GetRMContextArgs = {
  env: Env;
  request: Request;
};

export const getRMContext = async ({ env, request }: GetRMContextArgs) => {
  const session = await getSessionOrThrow({ env, request });

  return {
    baseUrl: env.RM_BASE_URL,
    session: session,
  };
};

export type RMContext = Awaited<ReturnType<typeof getRMContext>>;
