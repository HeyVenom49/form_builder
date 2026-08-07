import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * Shared ESLint config for Node.js packages.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
