import { router } from "./trpc";
import { createContext, type Context } from "./context";
import { authRouter } from "./router/auth/route";
import { formRouter } from "./router/form/route";
import { responseRouter } from "./router/response/route";
import { shareLinkRouter } from "./router/share-link/route";
import { collaboratorRouter } from "./router/collaborator/route";
import { webhookRouter } from "./router/webhook/route";
import { themeRouter } from "./router/theme/route";
import { fileRouter } from "./router/file/route";
import { analyticsRouter } from "./router/analytics/route";
import { templateRouter } from "./router/template/route";

export const serverRouter = router({
  auth: authRouter,
  form: formRouter,
  response: responseRouter,
  shareLink: shareLinkRouter,
  collaborator: collaboratorRouter,
  webhook: webhookRouter,
  theme: themeRouter,
  file: fileRouter,
  analytics: analyticsRouter,
  template: templateRouter,
});

export type ServerRouter = typeof serverRouter;

export { createContext };
export type { Context };
export { protectedProcedure, publicProcedure, TRPCError } from "./trpc";
