export const env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc",
  NEXT_PUBLIC_LOGGER_URL:
    process.env.NEXT_PUBLIC_LOGGER_URL ?? "http://localhost:4319",
};
