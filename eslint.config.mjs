import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/",
      "out/",
      "node_modules/",
      "dist/",
      "build/",
      ".env*",
      "*.log",
      "pids",
      "*.pid",
      "*.seed",
      "*.pid.lock",
      "coverage/",
      ".nyc_output",
      "jspm_packages/",
      ".npm",
      ".node_repl_history",
      "*.tgz",
      ".yarn-integrity",
      ".env",
      ".cache",
      ".parcel-cache",
      ".next",
      ".nuxt",
      ".vuepress/dist",
      ".serverless",
      ".fusebox/",
      ".dynamodb/",
      ".tern-port"
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
