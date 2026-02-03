import { z } from "zod";

export const numberFromString = (message: string, options?: { min?: number }) =>
  z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    options?.min !== undefined
      ? z.number({ invalid_type_error: message }).min(options.min, { message })
      : z.number({ invalid_type_error: message })
  );
