import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import jestPlugin from "eslint-plugin-jest";
import nextIntlTranslationKey from "./config/eslint-rules/next-intl-translation-key.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    files: ["src/**/*.{js,ts,jsx,tsx}"],
    ignores: ["src/**/__tests__/**", "src/**/__mocks__/**"],
    extends: compat.extends(
        "next",
        "next/core-web-vitals",
        "next/typescript",
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
        "eslint:recommended",
        "prettier"
    ),
    plugins: {
        jest: jestPlugin,
        "custom": {
            rules: {
                "next-intl-translation-key": nextIntlTranslationKey
            }
        }
    },
    languageOptions: {
        globals: jestPlugin.environments.globals.globals,
    },
    rules: {
        "react/jsx-no-literals": ["error", {
            noStrings: true,
            ignoreProps: true,
        }],
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "custom/next-intl-translation-key": "error"
    },
}]);