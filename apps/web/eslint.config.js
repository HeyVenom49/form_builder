import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["**/._*", "**/.next/**"],
  },
  ...nextJsConfig,
  {
    rules: {
      "react/prop-types": "off",
    },
  },
];
