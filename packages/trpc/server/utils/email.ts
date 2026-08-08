import { z } from "zod";

/** Trim/lowercase before format check — Zod's z.email().trim() validates first. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Invalid email address" }));

export const optionalEmailSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && value.trim() === "") return null;
    return value;
  },
  emailSchema.nullable().optional(),
);
