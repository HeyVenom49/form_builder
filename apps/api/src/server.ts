import express from "express";
import {
  createOpenApiExpressMiddleware,
  generateOpenApiDocument,
} from "trpc-to-openapi";
import { serverRouter, createContext } from "@repo/trpc/server";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import {
  errorLoggingMiddleware,
  installProcessHandlers,
  requestLoggingMiddleware,
} from "@repo/logger/middleware";
import { env } from "./env";
import { apiReference } from "@scalar/express-api-reference";

installProcessHandlers("api");

export const app = express();

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Form Builder API",
  version: "1.0.0",
  baseUrl: `${env.BASE_URL}/api`,
});

app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(requestLoggingMiddleware());

app.get("/", (_req, res) => {
  res.json({ message: "Form builder is up and running" });
});

app.get("/health", (_req, res) => {
  res.json({ message: "Form builder is healthy", healthy: true });
});

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.get("/doc", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(errorLoggingMiddleware());
