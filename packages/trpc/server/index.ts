import { router } from "./trpc";
import { createContext, type Context } from "./context";

export const serverRouter = router({});

export type ServerRouter = typeof serverRouter;

export { createContext };
export type { Context };
