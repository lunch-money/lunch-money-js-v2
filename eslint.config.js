import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "module",
				project: ["./tsconfig.json", "./tsconfig.tests.json"],
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			prettier: prettier,
		},
		rules: {
			...js.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			...prettierConfig.rules,
			"prettier/prettier": "error",
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-non-null-assertion": "warn",
		},
	},
	{
		files: ["**/*.js"],
		...js.configs.recommended,
	},
	{
		files: ["src/types.generated.ts"],
		rules: { "prettier/prettier": "off" },
	},
];
