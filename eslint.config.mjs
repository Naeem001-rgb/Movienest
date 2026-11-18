import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "impeccable/**",
    "skills/**",
    "taste-skill/**",
    ".playwright-cli/**",
    ".impeccable/**",
  ]),
]);

export default eslintConfig;
