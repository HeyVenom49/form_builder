import express from "express";
import {
  createOpenApiExpressMiddleware,
  generateOpenApiDocument,
} from "trpc-to-openapi";
import { serverRouter, createContext } from "@repo/trpc/server";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { apiReference } from "@scalar/express-api-reference";

export const app = express();

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_, res) => {
  return res.json({ message: "Form builder is up and running" });
});

app.get("/health", (_, res) => {
  return res.json({ message: "Form builder is healthy", healty: true });
});

app.get("/openapi.json", (_, res) => {
  return res.json(openApiDocument);
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
