import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("Loaded on client");
}

const schema = z.object({
  RM_BASE_URL: z.string(),
  SESSION_SECRET: z.string(),
});

export const serverEnv = schema.parse({
  RM_BASE_URL: process.env.RM_BASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
});
