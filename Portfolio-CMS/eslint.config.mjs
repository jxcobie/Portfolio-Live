import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPromise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**"
    ]
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.base.json"],
        tsconfigRootDir: import.meta.dirname
      },
      ecmaVersion: 2022,
      sourceType: "module"
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: eslintPluginImport,
      "jsx-a11y": eslintPluginJsxA11y,
      promise: eslintPluginPromise,
      react,
      "react-hooks": reactHooks
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/no-unresolved": "error",
      "promise/catch-or-return": "error",
      "import/no-unresolved": "off"
    },
    settings: {
      react: {
        version: "detect"
      },
      import: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        resolver: {
          typescript: {
            project: [
              "./tsconfig.base.json",
              "./apps/*/tsconfig.json",
              "./packages/*/tsconfig.json"
            ],
            alwaysTryTypes: true
          },
          node: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
          }
        }
      }
    }
  }
];
