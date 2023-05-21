declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Env {
    RM_BASE_URL: string;
    SESSION_SECRET: string;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type __Placeholder = number;
