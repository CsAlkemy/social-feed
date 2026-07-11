import globals from "globals";

import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for NestJS applications.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestJsConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
