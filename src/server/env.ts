import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("Loaded on client");
}

const schema = z.object({
  NODE_ENV: z.string(),
  RM_BASE_URL: z.string(),
  SESSION_SECRET: z.string(),
});

export const serverEnv = schema.parse({
  NODE_ENV: process?.env.NODE_ENV,
  RM_BASE_URL:
    typeof RM_BASE_URL !== "undefined" ? RM_BASE_URL : process?.env.RM_BASE_URL,
  SESSION_SECRET:
    typeof SESSION_SECRET !== "undefined"
      ? SESSION_SECRET
      : process?.env.SESSION_SECRET,
});
